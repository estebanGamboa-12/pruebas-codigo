'use client';

import { createClient } from '@supabase/supabase-js';
import { env } from './env';

const supabaseUrl = env.supabaseUrl;
const supabaseAnonKey = env.supabaseAnonKey;

export const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
