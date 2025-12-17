import { NextResponse } from 'next/server';
import { getServiceSupabase } from '../../../../lib/supabaseServer';
import { generateToken, hashToken } from '../../../../lib/token';

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
  if (profile?.role !== 'admin') {
    return NextResponse.json({ error: 'Admin only' }, { status: 403 });
  }

  const body = await req.json();
  const { eventId, ticketTypeId, quantity = 1 } = body as {
    eventId?: string;
    ticketTypeId?: string;
    quantity?: number;
  };

  if (!eventId || !ticketTypeId || quantity < 1) {
    return NextResponse.json({ error: 'Missing event or ticket type' }, { status: 400 });
  }

  const tokens: string[] = [];
  const rows = Array.from({ length: quantity }, () => {
    const token = generateToken();
    tokens.push(token);
    return {
      event_id: eventId,
      ticket_type_id: ticketTypeId,
      token_hash: hashToken(token),
      status: 'valid',
      created_at: new Date().toISOString(),
    };
  });

  const { error } = await supabase.from('tickets').insert(rows);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ tokens });
}
