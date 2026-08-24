import type { PagesFunction } from '@cloudflare/workers-types'
import { assertEnv, type Env } from '../../_lib/env'
import { bearerToken, json } from '../../_lib/http'
import { getAuthenticatedUser, getGovernanceRole, getSupervisorCoverageData, upsertProfile } from '../../_lib/supabase'
import { readHub } from '../../_lib/google'
import { buildHubBootstrap } from '../../_lib/hub'

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  try {
    assertEnv(env)
    const token = bearerToken(request)
    if (!token) return json({ error: 'Sessão não informada.' }, { status: 401 })

    const authUser = await getAuthenticatedUser(env, token)
    const governanceRole = await getGovernanceRole(token, authUser.id)
    const rawHub = await readHub(env)

    let coverageData: Awaited<ReturnType<typeof getSupervisorCoverageData>> | undefined
    try {
      coverageData = await getSupervisorCoverageData(token)
    } catch (coverageError) {
      console.error('hub/bootstrap coverage enrichment', coverageError instanceof Error ? coverageError.message : coverageError)
    }

    let bootstrap = buildHubBootstrap(rawHub, { id: authUser.id, email: authUser.email! }, new Date(), coverageData, governanceRole)
    await upsertProfile(env, bootstrap.profileRow)

    // Mantém a segunda tentativa para perfis que dependem da sincronização inicial no Supabase.
    if (!coverageData && bootstrap.profile.perfil === 'ADMIN') {
      try {
        coverageData = await getSupervisorCoverageData(token)
        bootstrap = buildHubBootstrap(rawHub, { id: authUser.id, email: authUser.email! }, new Date(), coverageData, governanceRole)
      } catch (coverageRetryError) {
        console.error('hub/bootstrap coverage retry', coverageRetryError instanceof Error ? coverageRetryError.message : coverageRetryError)
      }
    }

    const { profileRow: _internal, ...response } = bootstrap
    return json({ ...response, profile: { ...response.profile, governanceRole } })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'UNKNOWN_ERROR'

    if (message === 'AUTH_INVALID' || message === 'AUTH_EMAIL_MISSING') {
      return json({ error: 'Sessão inválida. Entre novamente.' }, { status: 401 })
    }
    if (message === 'HUB_USER_NOT_FOUND') {
      return json({ error: 'Seu e-mail não está cadastrado na HUB nem possui uma cobertura de supervisor vigente.' }, { status: 403 })
    }
    if (message === 'HUB_PROFILE_INVALID') {
      return json({ error: 'Seu cadastro não possui PerfilAcesso válido (ADMIN ou USUARIO).' }, { status: 403 })
    }

    console.error('hub/bootstrap', message)

    if (message.startsWith('Variáveis obrigatórias ausentes:')) {
      return json({ error: `Configuração do Cloudflare incompleta. ${message}` }, { status: 500 })
    }
    if (message.startsWith('HUB_BRIDGE_FAILED:')) {
      const status = message.split(':')[1] || 'desconhecido'
      return json({ error: `A ponte do Apps Script respondeu com erro HTTP ${status}. Verifique a URL /exec e a permissão da implantação.` }, { status: 500 })
    }
    if (message === 'HUB_BRIDGE_REJECTED:UNAUTHORIZED') {
      return json({ error: 'O Apps Script rejeitou o HUB_API_TOKEN. O token do Cloudflare e o da Propriedade do Script precisam ser idênticos.' }, { status: 500 })
    }
    if (message === 'HUB_BRIDGE_REJECTED:TOKEN_NOT_CONFIGURED') {
      return json({ error: 'HUB_API_TOKEN não está configurado nas Propriedades do Script do Apps Script.' }, { status: 500 })
    }
    if (message.startsWith('HUB_BRIDGE_REJECTED:SHEET_NOT_FOUND:')) {
      const sheet = message.slice('HUB_BRIDGE_REJECTED:SHEET_NOT_FOUND:'.length)
      return json({ error: `A ponte encontrou a planilha, mas não encontrou a aba ${sheet}.` }, { status: 500 })
    }
    if (message === 'HUB_BRIDGE_REJECTED:SPREADSHEET_NOT_BOUND') {
      return json({ error: 'O Apps Script não está vinculado à HUB revisada.' }, { status: 500 })
    }
    if (message === 'HUB_BRIDGE_INVALID_PAYLOAD') {
      return json({ error: 'A ponte do Apps Script respondeu, mas o conteúdo recebido não está no formato esperado.' }, { status: 500 })
    }

    return json({ error: 'Falha ao carregar a HUB. Verifique a integração do Google e tente novamente.' }, { status: 500 })
  }
}
