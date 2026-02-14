import { supabaseAdmin } from '@/lib/supabase/server';
import { createInterviewSandbox } from '@/lib/e2b/sandbox';
import { startActivityCapture } from '@/lib/e2b/monitor';

// Store active sandboxes
const activeSandboxes = new Map<string, any>();

export async function POST(req: Request) {
  try {
    const { session_id } = await req.json();
    const supabase = supabaseAdmin();

    // Get session with challenge
    const { data: session, error: sessionError } = await supabase
      .from('sessions')
      .select('*, challenges(*)')
      .eq('id', session_id)
      .single();

    if (sessionError || !session) {
      return Response.json({ error: 'Session not found' }, { status: 404 });
    }

    const challenge = (session as any).challenges;
    if (!challenge) {
      return Response.json({ error: 'No challenge associated with session' }, { status: 400 });
    }

    // Create E2B sandbox
    const { sandboxId, sandbox } = await createInterviewSandbox(
      challenge.generated_files,
      challenge.description
    );

    // Start activity capture
    const capture = await startActivityCapture(sandbox, session_id);
    activeSandboxes.set(session_id, { sandbox, capture });

    // Update session with sandbox ID and mark as active
    await supabase.from('sessions').update({
      sandbox_id: sandboxId,
      status: 'active',
      started_at: new Date().toISOString(),
    }).eq('id', session_id);

    // Insert session_start event
    await supabase.from('events').insert({
      session_id,
      event_type: 'session_start',
      raw_content: 'Interview session started',
    });

    return Response.json({
      sandbox_id: sandboxId,
      pty_pid: capture.pty.pid,
      status: 'active',
    });
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export { activeSandboxes };
