import { createClient } from '@supabase/supabase-js';
import { headers } from 'next/headers';
import { env } from './env';

const supabaseUrl = env.supabaseUrl;
const serviceKey = env.supabaseServiceRoleKey;

export function getServiceSupabase() {
  const authHeader = headers().get('authorization');
  return createClient(supabaseUrl, serviceKey, {
    global: {
      headers: authHeader ? { Authorization: authHeader } : undefined,
    },
  });
}
