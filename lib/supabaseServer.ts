import { createClient } from '@supabase/supabase-js';
import { headers } from 'next/headers';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export function getServiceSupabase() {
  const authHeader = headers().get('authorization');
  return createClient(supabaseUrl, serviceKey, {
    global: {
      headers: authHeader ? { Authorization: authHeader } : undefined,
    },
  });
}
