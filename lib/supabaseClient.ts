'use client';

import { createClient } from '@supabase/supabase-js';
import { envClient, hasSupabaseEnv } from './env-client';

const supabaseUrl = envClient.supabaseUrl;
const supabaseAnonKey = envClient.supabaseAnonKey;

export const supabaseClient = hasSupabaseEnv ? createClient(supabaseUrl, supabaseAnonKey) : null;

export const missingSupabaseConfigMessage =
  'Faltan las variables NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY. Agrégalas en tu entorno para conectar con Supabase.';
