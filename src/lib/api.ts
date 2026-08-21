import { supabase } from './supabase'
import type { HubBootstrap } from '../types/hub'

export type AccessEmailAction = 'first-access' | 'recover'

export async function requestAccessEmail(email: string, action: AccessEmailAction): Promise<string> {
  const response = await fetch('/api/auth/access', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({ email: email.trim().toLowerCase(), action }),
  })

  const payload = await response.json().catch(() => null) as { error?: string; message?: string } | null
  if (!response.ok) {
    throw new Error(payload?.error || 'Não foi possível enviar as instruções de acesso.')
  }

  return payload?.message || 'Se o e-mail estiver autorizado, você receberá as instruções de acesso em instantes.'
}

export async function getHubBootstrap(): Promise<HubBootstrap> {
  const { data: { session }, error: sessionError } = await supabase.auth.getSession()
  if (sessionError || !session?.access_token) {
    throw new Error('Sessão inválida. Entre novamente.')
  }

  const response = await fetch('/api/hub/bootstrap', {
    headers: {
      Authorization: `Bearer ${session.access_token}`,
      Accept: 'application/json',
    },
  })

  if (response.status === 401 || response.status === 403) {
    await supabase.auth.signOut()
  }

  const payload = await response.json().catch(() => null) as { error?: string } | HubBootstrap | null
  if (!response.ok) {
    const message = payload && 'error' in payload && payload.error
      ? payload.error
      : 'Não foi possível carregar os cadastros da HUB.'
    throw new Error(message)
  }

  return payload as HubBootstrap
}
