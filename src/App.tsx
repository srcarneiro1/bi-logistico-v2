import { useEffect, useState } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import type { Session } from '@supabase/supabase-js'
import { supabase } from './lib/supabase'
import { getHubBootstrap } from './lib/api'
import type { HubBootstrap } from './types/hub'
import { AppShell } from './components/AppShell'
import { LoginPage } from './pages/LoginPage'
import { HomePage } from './pages/HomePage'
import { FcaListPage } from './pages/FcaListPage'
import { NewFcaPage } from './pages/NewFcaPage'
import { FcaDetailPage } from './pages/FcaDetailPage'

export default function App() {
  const [session, setSession] = useState<Session | null>(null)
  const [hub, setHub] = useState<HubBootstrap | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    void supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
      if (!nextSession) setHub(null)
    })
    return () => listener.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!session) {
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    void getHubBootstrap()
      .then(setHub)
      .catch((err: unknown) => setError(err instanceof Error ? err.message : 'Falha ao carregar a HUB.'))
      .finally(() => setLoading(false))
  }, [session?.access_token])

  async function signOut() {
    await supabase.auth.signOut()
    setHub(null)
  }

  if (!session) return <LoginPage />
  if (loading) return <div className="center-state">Carregando contexto do BI…</div>
  if (error || !hub) {
    return (
      <div className="center-state center-state-error">
        <strong>Acesso não liberado</strong>
        <p>{error ?? 'Seu e-mail não possui um perfil válido na HUB.'}</p>
        <button className="button" onClick={() => void signOut()}>Voltar ao login</button>
      </div>
    )
  }

  return (
    <BrowserRouter>
      <AppShell profile={hub.profile} onSignOut={signOut}>
        <Routes>
          <Route path="/" element={<HomePage hub={hub} />} />
          <Route path="/fca" element={<FcaListPage hub={hub} />} />
          <Route path="/fca/novo" element={<NewFcaPage hub={hub} />} />
          <Route path="/fca/:id" element={<FcaDetailPage />} />
          <Route path="*" element={<HomePage hub={hub} />} />
        </Routes>
      </AppShell>
    </BrowserRouter>
  )
}
