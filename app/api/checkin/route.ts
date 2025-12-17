import { NextResponse } from 'next/server';
import { getServiceSupabase } from '../../../lib/supabaseServer';
import { hashToken } from '../../../lib/token';

export async function POST(req: Request) {
  const supabase = getServiceSupabase();
  const authHeader = req.headers.get('authorization');
  const jwt = authHeader?.replace('Bearer ', '') || undefined;
  const { data: userRes, error: userError } = await supabase.auth.getUser(jwt);
  if (userError || !userRes.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userRes.user.id)
    .maybeSingle();
  if (!profile || !['admin', 'staff'].includes(profile.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await req.json();
  const { token, eventId } = body as { token?: string; eventId?: string };
  if (!token || !eventId) {
    return NextResponse.json({ error: 'Missing token or event' }, { status: 400 });
  }

  const tokenHash = hashToken(token);
  const now = new Date().toISOString();

  const { data: updated, error: updateError } = await supabase
    .from('tickets')
    .update({ redeemed_at: now, redeemed_by: userRes.user.id, status: 'redeemed' })
    .eq('event_id', eventId)
    .eq('token_hash', tokenHash)
    .is('redeemed_at', null)
    .select('id')
    .maybeSingle();

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  if (updated?.id) {
    await supabase.from('checkins').insert({
      ticket_id: updated.id,
      event_id: eventId,
      scanned_by: userRes.user.id,
    });
    return NextResponse.json({ status: 'valid' });
  }

  const { data: existing } = await supabase
    .from('tickets')
    .select('id, redeemed_at')
    .eq('event_id', eventId)
    .eq('token_hash', tokenHash)
    .maybeSingle();

  if (existing) {
    if (existing.redeemed_at) {
      return NextResponse.json({ status: 'already_used' });
    }
  }

  return NextResponse.json({ status: 'not_found' });
}
