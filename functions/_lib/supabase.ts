import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL, type Env } from './env'

interface SupabaseAuthUser {
  id: string
  email?: string
}

export async function getAuthenticatedUser(_env: Env, accessToken: string): Promise<SupabaseAuthUser> {
  const response = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
    headers: {
      apikey: SUPABASE_PUBLISHABLE_KEY,
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json',
    },
  })

  if (!response.ok) throw new Error('AUTH_INVALID')
  const user = await response.json() as SupabaseAuthUser
  if (!user.id || !user.email) throw new Error('AUTH_EMAIL_MISSING')
  return user
}

export async function upsertProfile(
  env: Env,
  profile: {
    id: string
    email: string
    nome: string
    perfil: 'ADMIN' | 'USUARIO'
    supervisor_id: string | null
    ativo: boolean
  },
) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/profiles?on_conflict=id`, {
    method: 'POST',
    headers: {
      apikey: env.SUPABASE_SECRET_KEY,
      'Content-Type': 'application/json',
      Prefer: 'resolution=merge-duplicates,return=minimal',
    },
    body: JSON.stringify(profile),
  })

  if (!response.ok) {
    const detail = await response.text()
    throw new Error(`PROFILE_SYNC_FAILED:${response.status}:${detail.slice(0, 300)}`)
  }
}
