export const SUPABASE_URL = 'https://roeifyynzjnraispolzp.supabase.co'
export const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_A0PV6LaX7RcP1uMLD0LLpA_EqlBLp9k'

export interface Env {
  SUPABASE_SECRET_KEY: string
  HUB_API_URL: string
  HUB_API_TOKEN: string
}

export function assertEnv(env: Env) {
  const required: Array<keyof Env> = [
    'SUPABASE_SECRET_KEY',
    'HUB_API_URL',
    'HUB_API_TOKEN',
  ]
  const missing = required.filter((key) => !env[key])
  if (missing.length) throw new Error(`Variáveis obrigatórias ausentes: ${missing.join(', ')}`)
}
