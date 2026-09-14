import { FormEvent, useState } from 'react'
import { Button } from 'primereact/button'
import { InputText } from 'primereact/inputtext'
import { Message } from 'primereact/message'
import { Password } from 'primereact/password'
import { requestAccessEmail, type AccessEmailAction } from '../lib/api'
import { supabase } from '../lib/supabase'

const BRAND_LOGO = '/brand/unilog-logo-white-transparent.svg'
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

  return (
    <main className="login-page">
      <div className="login-shell">
        <section className="login-brand-panel" aria-label="BI Logístico Unilog">
          <img src={BRAND_LOGO} alt="Unilog Express" />
          <div>
            <span>PERFORMANCE OPERACIONAL</span>
            <h1>BI Logístico</h1>
            <p>Indicadores, supervisão, resultado financeiro e planos de ação em um único ambiente.</p>
          </div>
          <small>Unilog Express · V2</small>
        </section>

        <section className="login-card" aria-labelledby="login-heading">
          <div className="login-heading">
            <span>ACESSO RESTRITO</span>
            <h2 id="login-heading">{heading}</h2>
            <p>{description}</p>
          </div>

          {isLogin ? (
            <form onSubmit={submitLogin}>
              <label htmlFor="email">E-mail</label>
              <InputText
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="seu.email@empresa.com.br"
                required
                autoComplete="email"
                disabled={loading}
              />

              <label htmlFor="password">Senha</label>
              <Password
                inputId="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Sua senha"
                required
                autoComplete="current-password"
                feedback={false}
                toggleMask
                disabled={loading}
                className="login-password"
                inputClassName="login-password-input"
              />

              <Button
                label="Entrar"
                loading={loading}
                type="submit"
                className="button-primary login-submit"
              />
              <Button
                label="Primeiro acesso"
                type="button"
                className="button-ghost"
                onClick={() => changeMode('first-access')}
                disabled={loading}
              />
              <Button
                label="Esqueci minha senha"
                type="button"
                className="button-ghost"
                onClick={() => changeMode('recover')}
                disabled={loading}
              />
            </form>
          ) : (
            <form onSubmit={submitAccessRequest}>
              <label htmlFor="access-email">E-mail</label>
              <InputText
                id="access-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="seu.email@empresa.com.br"
                required
                autoComplete="email"
                disabled={loading}
              />
              <Button
                label={mode === 'first-access' ? 'Enviar link para definir senha' : 'Enviar link de recuperação'}
                loading={loading}
                type="submit"
                className="button-primary login-submit"
              />
              <Button
                label="Voltar ao login"
                type="button"
                className="button-ghost"
                onClick={() => changeMode('login')}
                disabled={loading}
              />
            </form>
          )}

          {error && <Message severity="error" text={error} className="login-message" />}
          {success && <Message severity="success" text={success} className="login-message" />}

          <div className="login-security-note">
            O acesso aos dados respeita o perfil e o escopo cadastrados na HUB. Nenhuma senha é compartilhada ou definida pela administração.
          </div>
        </section>
      </div>
    </main>
  )
}
