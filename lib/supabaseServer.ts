import { createClient } from '@supabase/supabase-js';
import { headers } from 'next/headers';
import { envServer } from './env-server';

const supabaseUrl = envServer.supabaseUrl;
const serviceKey = envServer.supabaseServiceRoleKey;

export function getServiceSupabase() {
  const authHeader = headers().get('authorization');
  return createClient(supabaseUrl, serviceKey, {
    global: {
      headers: authHeader ? { Authorization: authHeader } : undefined,
    },
  });
}
