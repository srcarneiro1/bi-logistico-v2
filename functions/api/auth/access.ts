import type { PagesFunction } from '@cloudflare/workers-types'
import { createClient } from '@supabase/supabase-js'
import { assertEnv, SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL, type Env } from '../../_lib/env'
import { readHub, type HubRawData } from '../../_lib/google'
import { json } from '../../_lib/http'

type AccessAction = 'first-access' | 'recover'

interface AccessRequest {
  email?: unknown
  action?: unknown
}

const GENERIC_MESSAGE = 'Se o e-mail estiver autorizado, você receberá as instruções de acesso em instantes.'

function emailKey(value: unknown) {
  return String(value ?? '').trim().toLowerCase()
}

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

function headerIndex(headers: string[], name: string) {
  return headers.findIndex((header) => header.trim().toLowerCase() === name.toLowerCase())
}

function authorizedSupervisor(rawHub: HubRawData, email: string) {
  const [headers = [], ...rows] = rawHub.supervisors
  const emailIndex = headerIndex(headers, 'Email')
  const profileIndex = headerIndex(headers, 'PerfilAcesso')
  if (emailIndex < 0 || profileIndex < 0) throw new Error('HUB_AUTH_COLUMNS_MISSING')

  return rows.some((row) => {
    const profile = String(row[profileIndex] ?? '').trim().toUpperCase()
    return emailKey(row[emailIndex]) === email && (profile === 'ADMIN' || profile === 'USUARIO')
  })
}

function randomPassword() {
  const bytes = new Uint8Array(32)
  crypto.getRandomValues(bytes)
  const token = Array.from(bytes, (value) => value.toString(16).padStart(2, '0')).join('')
  return `U!${token}a9`
}

function adminClient(env: Env) {
  return createClient(SUPABASE_URL, env.SUPABASE_SECRET_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}

function publicAuthClient() {
  return createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  })
}

async function authorizedActiveSubstitute(env: Env, email: string) {
  const admin = adminClient(env)
  const { data: substitute, error: substituteError } = await admin
    .from('supervisor_substitutos')
    .select('id,email,ativo')
    .ilike('email', email)
    .eq('ativo', true)
    .maybeSingle()
  if (substituteError) throw new Error(`AUTH_COVERAGE_LOOKUP_FAILED:${substituteError.message}`)
  if (!substitute) return false

  const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo' }).format(new Date())
  const { data: coverage, error: coverageError } = await admin
    .from('supervisor_substituicoes')
    .select('id')
    .eq('substituto_master_id', substitute.id)
    .ilike('substituto_email_snapshot', email)
    .eq('status', 'ATIVA')
    .lte('data_inicio', today)
    .gte('data_fim', today)
    .limit(1)
    .maybeSingle()
  if (coverageError) throw new Error(`AUTH_COVERAGE_LOOKUP_FAILED:${coverageError.message}`)
  return Boolean(coverage)
}

async function findAuthUserByEmail(env: Env, email: string) {
  const admin = adminClient(env)
  let page = 1

  while (page <= 20) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 1000 })
    if (error) throw new Error(`AUTH_LIST_USERS_FAILED:${error.message}`)
    const matched = data.users.find((user) => emailKey(user.email) === email)
    if (matched) return matched
    if (data.users.length < 1000) return null
    page += 1
  }

  throw new Error('AUTH_USER_LOOKUP_LIMIT')
}

async function ensureFirstAccessUser(env: Env, email: string) {
  const existing = await findAuthUserByEmail(env, email)
  if (existing) return existing

  const admin = adminClient(env)
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password: randomPassword(),
    email_confirm: true,
  })
  if (error) throw new Error(`AUTH_CREATE_USER_FAILED:${error.message}`)
  return data.user
}

async function sendPasswordLink(email: string, redirectTo: string) {
  const auth = publicAuthClient()
  const { error } = await auth.auth.resetPasswordForEmail(email, { redirectTo })
  if (error) throw new Error(`AUTH_RECOVERY_FAILED:${error.message}`)
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  try {
    assertEnv(env)
    const body = await request.json().catch(() => null) as AccessRequest | null
    const email = emailKey(body?.email)
    const action = body?.action === 'recover' ? 'recover' : body?.action === 'first-access' ? 'first-access' : null

    if (!action || !isEmail(email)) {
      return json({ error: 'Informe um e-mail válido.' }, { status: 400 })
    }

    const rawHub = await readHub(env)
    const supervisorAuthorized = authorizedSupervisor(rawHub, email)
    const substituteAuthorized = supervisorAuthorized ? false : await authorizedActiveSubstitute(env, email)
    if (!supervisorAuthorized && !substituteAuthorized) {
      return json({ ok: true, message: GENERIC_MESSAGE })
    }

    if (action === 'first-access') {
      await ensureFirstAccessUser(env, email)
    } else {
      const existing = await findAuthUserByEmail(env, email)
      if (!existing) return json({ ok: true, message: GENERIC_MESSAGE })
    }

    const origin = new URL(request.url).origin
    await sendPasswordLink(email, `${origin}/`)
    return json({ ok: true, message: GENERIC_MESSAGE })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'UNKNOWN_ERROR'
    console.error('auth/access', message)

    if (message.startsWith('Variáveis obrigatórias ausentes:')) {
      return json({ error: 'Configuração de autenticação incompleta no servidor.' }, { status: 500 })
    }
    if (message === 'HUB_AUTH_COLUMNS_MISSING') {
      return json({ error: 'A HUB não possui as colunas de autorização esperadas.' }, { status: 500 })
    }
    if (message.startsWith('HUB_BRIDGE_FAILED:') || message.startsWith('HUB_BRIDGE_REJECTED:') || message === 'HUB_BRIDGE_INVALID_PAYLOAD') {
      return json({ error: 'Não foi possível validar o acesso na HUB. Tente novamente em instantes.' }, { status: 503 })
    }
    if (message.startsWith('AUTH_COVERAGE_LOOKUP_FAILED:')) {
      return json({ error: 'Não foi possível validar a cobertura temporária no momento. Tente novamente em instantes.' }, { status: 503 })
    }
    if (message.startsWith('AUTH_RECOVERY_FAILED:')) {
      return json({ error: 'Não foi possível enviar o e-mail agora. Aguarde alguns minutos e tente novamente.' }, { status: 429 })
    }
    if (message.startsWith('AUTH_LIST_USERS_FAILED:') || message.startsWith('AUTH_CREATE_USER_FAILED:') || message === 'AUTH_USER_LOOKUP_LIMIT') {
      return json({ error: 'Não foi possível preparar o acesso no momento. Tente novamente em instantes.' }, { status: 503 })
    }

    return json({ error: 'Falha ao preparar o acesso. Tente novamente.' }, { status: 500 })
  }
}
