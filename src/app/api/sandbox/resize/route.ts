import { getOrReconnectSandbox } from '../create/route';

export async function POST(req: Request) {
  try {
    const { session_id, cols, rows } = await req.json();
    if (!session_id || !cols || !rows) {
      return Response.json({ error: 'session_id, cols, rows required' }, { status: 400 });
    }

    const sandboxInfo = await getOrReconnectSandbox(session_id);
    if (!sandboxInfo?.capture?.pty?.resize) {
      return Response.json({ error: 'No active sandbox' }, { status: 404 });
    }

    await sandboxInfo.capture.pty.resize(cols, rows);
    return Response.json({ success: true });
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
