import { Sandbox } from 'e2b';
import Anthropic from '@anthropic-ai/sdk';
import { getOrReconnectSandbox, activeSandboxes } from '../create/route';
import { supabaseAdmin } from '@/lib/supabase/server';
import { stopObserverLoop } from '@/lib/agents/observer';
import { SUMMARY_SYSTEM, SUMMARY_USER } from '@/lib/agents/prompts';

const anthropic = new Anthropic();

export async function POST(req: Request) {
  try {
    const { session_id } = await req.json();
    if (!session_id) {
      return Response.json({ error: 'session_id required' }, { status: 400 });
    }

    const supabase = supabaseAdmin();

    // Get session + challenge + rubric info
    const { data: session } = await supabase
      .from('sessions')
      .select('*, challenges(*), rubrics(*)')
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

    // Stop observer loop
    stopObserverLoop(session_id);

    // Kill sandbox
    const activeSbInfo = activeSandboxes.get(session_id);
    if (activeSbInfo) {
      activeSbInfo.capture?.stop();
      try { await activeSbInfo.sandbox.kill(); } catch (e) {
        console.error('[submit] Failed to kill sandbox:', e);
      }
      activeSandboxes.delete(session_id);
    } else if (sandbox) {
      try { await sandbox.kill(); } catch (e) {
        console.error('[submit] Failed to kill reconnected sandbox:', e);
      }
    }

    // Generate summary inline — fire-and-forget HTTP was unreliable on multi-machine Fly.io
    const challenge = (session as any).challenges;
    const rubric = (session as any).rubrics;
    const durationSeconds = session.started_at
      ? Math.floor((Date.now() - new Date(session.started_at).getTime()) / 1000)
      : 0;

    const [{ data: allEvents }, { data: allInsights }] = await Promise.all([
      supabase.from('events').select('*').eq('session_id', session_id).order('timestamp', { ascending: true }),
      supabase.from('insights').select('*').eq('session_id', session_id).order('timestamp', { ascending: true }),
    ]);

    let summaryContent;
    try {
      console.log('[submit] Generating summary for session', session_id);
      const response = await anthropic.messages.create({
        model: 'claude-opus-4-6',
        max_tokens: 3000,
        system: SUMMARY_SYSTEM,
        messages: [{
          role: 'user',
          content: SUMMARY_USER(
            challenge?.description || '',
            challenge?.expected_bugs || [],
            rubric?.criteria || [],
            allEvents || [],
            allInsights || [],
            durationSeconds
          ),
        }],
      });

      const textBlock = response.content.find(b => b.type === 'text');
      const summaryText = textBlock ? textBlock.text : '{}';
      const cleaned = summaryText.replace(/```json\n?|\n?```/g, '').trim();
      try {
        summaryContent = JSON.parse(cleaned);
      } catch {
        summaryContent = { overall_score: 0, one_line_summary: 'Failed to parse summary JSON' };
      }
      console.log('[submit] Summary generated successfully');
    } catch (error) {
      console.error('[submit] Summary generation failed:', error);
      summaryContent = {
        overall_score: 0,
        hiring_signal: 'unknown',
        one_line_summary: 'Summary generation encountered an error',
        rubric_scores: [],
        strengths: [],
        concerns: [],
        recommended_follow_ups: [],
      };
    }

    // Insert summary insight + session_end event
    await Promise.all([
      supabase.from('insights').insert({
        session_id,
        insight_type: 'summary',
        content: summaryContent,
      }),
      supabase.from('events').insert({
        session_id,
        event_type: 'session_end',
        raw_content: 'Interview session ended',
      }),
    ]);

    return Response.json({ success: true, testsPassed, summary: summaryContent });
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
