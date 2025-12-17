export const envClient = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '',
};

export const hasSupabaseEnv = Boolean(envClient.supabaseUrl && envClient.supabaseAnonKey);
