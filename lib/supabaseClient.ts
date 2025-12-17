'use client';

import { createClient } from '@supabase/supabase-js';
import { envClient } from './env-client';

const supabaseUrl = envClient.supabaseUrl;
const supabaseAnonKey = envClient.supabaseAnonKey;

export const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
