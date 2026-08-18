import { supabase } from './supabase'
import type { HubBootstrap } from '../types/hub'

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
