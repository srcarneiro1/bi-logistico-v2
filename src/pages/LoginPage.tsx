import { FormEvent, useState } from 'react'
import { requestAccessEmail, type AccessEmailAction } from '../lib/api'
import { supabase } from '../lib/supabase'

const BRAND_LOGO='https://raw.githubusercontent.com/srcarneiro1/forecast-planner/main/public/brand/unilog-logo-white-transparent.svg'
type LoginMode = 'login' | AccessEmailAction

function loginErrorMessage(code?: string) {
  if (code === 'invalid_credentials') return 'E-mail ou senha inválidos.'
  if (code === 'email_not_confirmed') return 'Seu e-mail ainda não foi confirmado.'
  if (code === 'over_request_rate_limit') return 'Muitas tentativas seguidas. Aguarde alguns minutos e tente novamente.'
  return 'Não foi possível entrar. Verifique os dados e tente novamente.'
}

export function LoginPage() {
  const [mode, setMode] = useState<LoginMode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  function changeMode(nextMode: LoginMode) {
    setMode(nextMode)
    setPassword('')
    setError(null)
    setSuccess(null)
  }

  async function submitLogin(event: FormEvent) {
    event.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    })

    if (signInError) setError(loginErrorMessage(signInError.code))
    setLoading(false)
  }

  async function submitAccessRequest(event: FormEvent) {
    event.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const message = await requestAccessEmail(email, mode as AccessEmailAction)
      setSuccess(message)
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Não foi possível enviar as instruções de acesso.')
    } finally {
      setLoading(false)
    }
  }

  const isLogin = mode === 'login'
  const heading = mode === 'first-access' ? 'Primeiro acesso' : mode === 'recover' ? 'Recuperar senha' : 'Entrar no sistema'
  const description = mode === 'first-access'
    ? 'Informe o mesmo e-mail cadastrado na HUB para receber o link de definição da sua senha.'
    : mode === 'recover'
      ? 'Informe seu e-mail de acesso para receber um link seguro de recuperação.'
      : 'Use o mesmo e-mail autorizado na HUB.'

  return <div className="login-page"><div className="login-shell"><section className="login-brand-panel"><img src={BRAND_LOGO} alt="Unilog Express"/><div><span>PERFORMANCE OPERACIONAL</span><h1>BI Logístico</h1><p>Indicadores, supervisão, resultado financeiro e planos de ação em um único ambiente.</p></div><small>Unilog Express · V2</small></section><section className="login-card"><div className="login-heading"><span>ACESSO RESTRITO</span><h2>{heading}</h2><p>{description}</p></div>{isLogin?<form onSubmit={submitLogin}><label htmlFor="email">E-mail</label><input id="email" type="email" value={email} onChange={event=>setEmail(event.target.value)} placeholder="seu.email@empresa.com.br" required autoComplete="email"/><label htmlFor="password">Senha</label><input id="password" type="password" value={password} onChange={event=>setPassword(event.target.value)} placeholder="Sua senha" required autoComplete="current-password"/><button className="button button-primary login-submit" type="submit" disabled={loading}>{loading?'Entrando…':'Entrar'}</button><button className="button button-ghost" type="button" onClick={()=>changeMode('first-access')} disabled={loading}>Primeiro acesso</button><button className="button button-ghost" type="button" onClick={()=>changeMode('recover')} disabled={loading}>Esqueci minha senha</button></form>:<form onSubmit={submitAccessRequest}><label htmlFor="access-email">E-mail</label><input id="access-email" type="email" value={email} onChange={event=>setEmail(event.target.value)} placeholder="seu.email@empresa.com.br" required autoComplete="email"/><button className="button button-primary login-submit" type="submit" disabled={loading}>{loading?'Enviando…':mode==='first-access'?'Enviar link para definir senha':'Enviar link de recuperação'}</button><button className="button button-ghost" type="button" onClick={()=>changeMode('login')} disabled={loading}>Voltar ao login</button></form>}{error&&<div className="notice notice-error">{error}</div>}{success&&<div className="notice notice-success">{success}</div>}<div className="login-security-note">O acesso aos dados respeita o perfil e o escopo cadastrados na HUB. Nenhuma senha é compartilhada ou definida pela administração.</div></section></div></div>
}
