import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL, type Env } from './env'

interface SupabaseAuthUser {
  id: string
  email?: string
}

export interface SupabaseSubstitute {
  id: string
  codigo: string
  nome: string
  email: string | null
  ativo: boolean
}

export interface SupabaseCoverage {
  id: string
  legacy_substituicao_id: string | null
  supervisor_titular_id: string
  supervisor_titular_nome: string
  substituto_master_id: string
  substituto_codigo_snapshot: string
  substituto_nome_snapshot: string
  substituto_email_snapshot: string | null
  modulo_id: string
  data_inicio: string
  data_fim: string
  motivo: string | null
  status: 'ATIVA' | 'ENCERRADA' | 'CANCELADA'
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

function secretHeaders(env: Env, extra?: Record<string, string>): Record<string, string> {
  return {
    apikey: env.SUPABASE_SECRET_KEY,
    Accept: 'application/json',
    ...extra,
  }
}

async function secretGet<T>(env: Env, path: string): Promise<T> {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    headers: secretHeaders(env),
  })
  if (!response.ok) {
    const detail = await response.text()
    throw new Error(`SUPABASE_READ_FAILED:${response.status}:${detail.slice(0, 300)}`)
  }
  return await response.json() as T
}

export async function getSupervisorCoverageData(env: Env) {
  const [substitutes, coverages] = await Promise.all([
    secretGet<SupabaseSubstitute[]>(env, 'supervisor_substitutos?select=id,codigo,nome,email,ativo&order=nome.asc'),
    secretGet<SupabaseCoverage[]>(env, 'supervisor_substituicoes?select=id,legacy_substituicao_id,supervisor_titular_id,supervisor_titular_nome,substituto_master_id,substituto_codigo_snapshot,substituto_nome_snapshot,substituto_email_snapshot,modulo_id,data_inicio,data_fim,motivo,status&order=data_inicio.desc'),
  ])
  return { substitutes, coverages }
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
    headers: secretHeaders(env, {
      'Content-Type': 'application/json',
      Prefer: 'resolution=merge-duplicates,return=minimal',
    }),
    body: JSON.stringify(profile),
  })

  if (!response.ok) {
    const detail = await response.text()
    throw new Error(`PROFILE_SYNC_FAILED:${response.status}:${detail.slice(0, 300)}`)
  }
}
