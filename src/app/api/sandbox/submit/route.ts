import { Sandbox } from 'e2b';
import { getOrReconnectSandbox, activeSandboxes } from '../create/route';
import { supabaseAdmin } from '@/lib/supabase/server';
import { stopObserverLoop } from '@/lib/agents/observer';

export async function POST(req: Request) {
  try {
    const { session_id } = await req.json();
    if (!session_id) {
      return Response.json({ error: 'session_id required' }, { status: 400 });
    }

    const supabase = supabaseAdmin();

    // Get session + challenge info
    const { data: session } = await supabase
      .from('sessions')
      .select('*, challenges(*)')
      .eq('id', session_id)
      .single();

    if (!session) return Response.json({ error: 'Session not found' }, { status: 404 });

    // Get sandbox and run final test verification
    const sandboxInfo = await getOrReconnectSandbox(session_id);
    const sandbox = sandboxInfo?.sandbox as Sandbox | undefined;

    let testsPassed = true;
    let testOutput = '';

    if (sandbox) {
      const files = (session as any).challenges?.generated_files || {};
      const filenames = Object.keys(files);
      let testCmd: string | null = null;

      if (filenames.some((f: string) => f.endsWith('.py'))) {
        testCmd = 'cd /home/user/project && python -m pytest .atrium_tests/ -v 2>&1';
      } else if (filenames.some((f: string) => f.match(/\.(ts|tsx|js|jsx)$/))) {
        testCmd = 'cd /home/user/project && npx jest --roots .atrium_tests/ 2>&1';
      }

      if (testCmd) {
        const checkResult = await sandbox.commands.run(
          'ls /home/user/project/.atrium_tests/ 2>/dev/null | head -1',
          { timeoutMs: 5000 }
        );
        if (checkResult.stdout?.trim()) {
          try {
            const result = await sandbox.commands.run(testCmd, { timeoutMs: 30000 });
            testOutput = [result.stdout, result.stderr].filter(Boolean).join('\n');
            testsPassed = result.exitCode === 0;
          } catch {
            testOutput = 'Test execution timed out';
            testsPassed = false;
          }
        }
      }
    }

    // Insert submission event
    await supabase.from('events').insert({
      session_id,
      event_type: 'submission',
      raw_content: testOutput || 'Submitted',
      metadata: { tests_passed: testsPassed },
    });

    // End session
    await supabase
      .from('sessions')
      .update({ status: 'completed', ended_at: new Date().toISOString() })
      .eq('id', session_id);

    // Stop observer loop inline (don't rely on end route for this)
    stopObserverLoop(session_id);

    // Kill sandbox inline — end route may hit a different machine where Map is empty
    const activeSbInfo = activeSandboxes.get(session_id);
    if (activeSbInfo) {
      activeSbInfo.capture?.stop();
      try { await activeSbInfo.sandbox.kill(); } catch (e) {
        console.error('[submit] Failed to kill sandbox:', e);
      }
      activeSandboxes.delete(session_id);
    } else if (sandbox) {
      // sandbox from getOrReconnectSandbox — kill it directly
      try { await sandbox.kill(); } catch (e) {
        console.error('[submit] Failed to kill reconnected sandbox:', e);
      }
    }

    // Fire-and-forget summary generation only (sandbox already dead)
    const origin = new URL(req.url).origin;
    fetch(`${origin}/api/sessions/${session_id}/end`, { method: 'POST' })
      .catch((e) => console.error('[submit] Fire-and-forget end route failed:', e));

    return Response.json({ success: true, testsPassed });
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
