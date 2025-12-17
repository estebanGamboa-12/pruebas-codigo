function getEnvVariable(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export const env = {
  supabaseUrl: getEnvVariable('NEXT_PUBLIC_SUPABASE_URL'),
  supabaseAnonKey: getEnvVariable('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
  supabaseServiceRoleKey: getEnvVariable('SUPABASE_SERVICE_ROLE_KEY'),
};
