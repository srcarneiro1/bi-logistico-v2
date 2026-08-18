import { assertEnv, type Env } from '../functions/_lib/env'
import { bearerToken, json } from '../functions/_lib/http'
import { readHub } from '../functions/_lib/google'
import { buildHubBootstrap } from '../functions/_lib/hub'
import { getAuthenticatedUser, upsertProfile } from '../functions/_lib/supabase'

async function handleHealth() {
  return json({
    ok: true,
    service: 'bi-logistico-v2',
    runtime: 'cloudflare-workers',
    timestamp: new Date().toISOString(),
  })
}

async function handleHubBootstrap(request: Request, env: Env) {
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
    return json({ error: 'Falha ao carregar a HUB. Verifique a ponte de leitura e tente novamente.' }, { status: 500 })
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url)

    if (url.pathname.startsWith('/api/')) {
      if (request.method === 'GET' && url.pathname === '/api/health') {
        return handleHealth()
      }

      if (request.method === 'GET' && url.pathname === '/api/hub/bootstrap') {
        return handleHubBootstrap(request, env)
      }

      return json({ error: 'Endpoint não encontrado.' }, { status: 404 })
    }

    return env.ASSETS.fetch(request)
  },
} satisfies ExportedHandler<Env>
