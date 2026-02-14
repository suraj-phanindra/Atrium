import { supabaseAdmin } from '@/lib/supabase/server';

export async function GET(req: Request) {
  const supabase = supabaseAdmin();
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (id) {
    const { data, error } = await supabase
      .from('sessions')
      .select('*, challenges(*), rubrics(*)')
      .eq('id', id)
      .single();

    if (error) return Response.json({ error: error.message }, { status: 404 });
    return Response.json(data);
  }

  const { data, error } = await supabase
    .from('sessions')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json(data);
}

export async function POST(req: Request) {
  const supabase = supabaseAdmin();
  const body = await req.json();

  const { data, error } = await supabase
    .from('sessions')
    .insert({
      interviewer_id: body.interviewer_id || 'anonymous',
      candidate_name: body.candidate_name || null,
      challenge_id: body.challenge_id || null,
      rubric_id: body.rubric_id || null,
      duration_minutes: body.duration_minutes || 45,
    })
    .select()
    .single();

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json(data, { status: 201 });
}
