import 'server-only';

function getEnvVariable(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export const envServer = {
  supabaseUrl: getEnvVariable('NEXT_PUBLIC_SUPABASE_URL'),
  supabaseServiceRoleKey: getEnvVariable('SUPABASE_SERVICE_ROLE_KEY'),
};
