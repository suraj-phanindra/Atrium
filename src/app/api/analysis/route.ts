import { startObserverLoop, stopObserverLoop } from '@/lib/agents/observer';

export async function POST(req: Request) {
  try {
    const { session_id, action } = await req.json();

    if (action === 'start') {
      await startObserverLoop(session_id);
      return Response.json({ status: 'started', session_id });
    } else if (action === 'stop') {
      stopObserverLoop(session_id);
      return Response.json({ status: 'stopped', session_id });
    }

    return Response.json({ error: 'Invalid action. Use "start" or "stop".' }, { status: 400 });
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
