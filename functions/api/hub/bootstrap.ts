import type { PagesFunction } from '@cloudflare/workers-types'
import { assertEnv, type Env } from '../../_lib/env'
import { bearerToken, json } from '../../_lib/http'
import { getAuthenticatedUser, upsertProfile } from '../../_lib/supabase'
import { readHub } from '../../_lib/google'
import { buildHubBootstrap } from '../../_lib/hub'

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  try {
    assertEnv(env)
    const token = bearerToken(request)
    if (!token) return json({ error: 'Sessão não informada.' }, { status: 401 })

    const authUser = await getAuthenticatedUser(env, token)
    const rawHub = await readHub(env)
    const bootstrap = buildHubBootstrap(rawHub, { id: authUser.id, email: authUser.email! })

    await upsertProfile(env, bootstrap.profileRow)

    const { profileRow: _internal, ...response } = bootstrap
    return json(response)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'UNKNOWN_ERROR'
    if (message === 'AUTH_INVALID' || message === 'AUTH_EMAIL_MISSING') {
      return json({ error: 'Sessão inválida. Entre novamente.' }, { status: 401 })
    }
    if (message === 'HUB_USER_NOT_FOUND') {
      return json({ error: 'Seu e-mail não está cadastrado na dSupervisores da HUB.' }, { status: 403 })
    }
    if (message === 'HUB_PROFILE_INVALID') {
      return json({ error: 'Seu cadastro não possui PerfilAcesso válido (ADMIN ou USUARIO).' }, { status: 403 })
    }
    console.error('hub/bootstrap', message)
    return json({ error: 'Falha ao carregar a HUB. Verifique a integração do Google e tente novamente.' }, { status: 500 })
  }
}
