import { Sandbox } from 'e2b';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function startActivityCapture(sandbox: Sandbox, sessionId: string) {
  const supabase = supabaseAdmin();

  // File watcher
  const watcher = await sandbox.files.watchDir('/home/user/project', async (event) => {
    await supabase.from('events').insert({
      session_id: sessionId,
      event_type: 'file_change',
      raw_content: JSON.stringify(event),
      metadata: { type: event.type, name: event.name },
    });
  }, { timeoutMs: 0 });

  // PTY (bidirectional terminal)
  const handle = await sandbox.pty.create({
    cols: 120,
    rows: 40,
    cwd: '/home/user/project',
    onData: async (data: Uint8Array) => {
      const text = new TextDecoder().decode(data);
      // Store in events table
      await supabase.from('events').insert({
        session_id: sessionId,
        event_type: 'terminal_output',
        raw_content: text,
      });
      // Broadcast to candidate's browser via Supabase Realtime
      await supabase.channel(`terminal:${sessionId}`).send({
        type: 'broadcast',
        event: 'terminal_data',
        payload: { data: text },
      });
    },
  });

  return {
    pty: {
      pid: handle.pid,
      sendInput: (data: string) => sandbox.pty.sendInput(handle.pid, new TextEncoder().encode(data)),
    },
    stop: () => watcher.stop(),
  };
}
