import { startObserverLoop, stopObserverLoop, runObserverCycle } from '@/lib/agents/observer';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function POST(req: Request) {
  try {
    const { session_id, action } = await req.json();

    if (action === 'start') {
      await startObserverLoop(session_id);
      return Response.json({ status: 'started', session_id });
    } else if (action === 'stop') {
      stopObserverLoop(session_id);
      return Response.json({ status: 'stopped', session_id });
    } else if (action === 'run_cycle') {
      // Run one immediate observer cycle
      const supabase = supabaseAdmin();
      const { data: session } = await supabase
        .from('sessions')
        .select('*, challenges(*), rubrics(*)')
        .eq('id', session_id)
        .single();

      const s = session as any;
      if (!s?.challenges || !s?.rubrics) {
        return Response.json({ error: 'Missing challenge or rubric' }, { status: 400 });
      }

      // Get recent insights for context
      const { data: recentInsights } = await supabase
        .from('insights')
        .select('*')
        .eq('session_id', session_id)
        .order('timestamp', { ascending: false })
        .limit(10);

      await runObserverCycle({
        sessionId: session_id,
        challengeDescription: s.challenges.description,
        expectedBugs: s.challenges.expected_bugs || [],
        solutionHints: s.challenges.solution_hints || '',
        rubricCriteria: s.rubrics.criteria || [],
        lastProcessedEventId: 0,
        previousInsights: (recentInsights || []).reverse(),
        sessionStartTime: new Date(session.started_at || session.created_at),
      });

      return Response.json({ status: 'cycle_complete' });
    }

    return Response.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
