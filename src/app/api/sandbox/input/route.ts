import { activeSandboxes } from '../create/route';

export async function POST(req: Request) {
  try {
    const { session_id, data } = await req.json();

    const sandboxInfo = activeSandboxes.get(session_id);
    if (!sandboxInfo) {
      return Response.json({ error: 'No active sandbox for this session' }, { status: 404 });
    }

    await sandboxInfo.capture.pty.sendInput(data);

    return Response.json({ success: true });
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
