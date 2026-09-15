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
  const heading = mode === 'first-access' ? 'Primeiro acesso' : mode === 'recover' ? 'Recuperar senha' : 'Bem-vindo de volta'
  const description = mode === 'first-access'
    ? 'Informe o mesmo e-mail cadastrado na HUB para receber o link de definição da sua senha.'
    : mode === 'recover'
      ? 'Informe seu e-mail de acesso para receber um link seguro de recuperação.'
      : 'Entre com o e-mail autorizado para acessar sua operação e seus indicadores.'

  return (
    <main className="login-page">
      <section className="login-shell" aria-labelledby="login-heading">
        <aside className="login-brand-panel" aria-label="BI Logístico Unilog">
          <div className="login-brand-topline">
            <img src={BRAND_LOGO} alt="Unilog Express" />
            <span className="login-product-chip">BI Logístico V2</span>
          </div>

          <div className="login-brand-copy">
            <span className="login-overline login-overline-light">PERFORMANCE OPERACIONAL</span>
            <h1>Decisão logística com leitura simples e gestão rigorosa.</h1>
            <p>Indicadores, supervisão, resultado financeiro e planos de ação reunidos em um único ambiente executivo.</p>
          </div>

          <div className="login-proof">
            <span><i className="pi pi-shield" aria-hidden="true" /> Acesso protegido</span>
            <span><i className="pi pi-lock" aria-hidden="true" /> Escopo por perfil</span>
          </div>
        </aside>

        <section className="login-form-panel">
          <div className="login-heading">
            <span className="login-overline">{isLogin ? 'ACESSO À PLATAFORMA' : mode === 'first-access' ? 'PRIMEIRO ACESSO' : 'RECUPERAÇÃO DE ACESSO'}</span>
            <h2 id="login-heading">{heading}</h2>
            <p>{description}</p>
          </div>

          {isLogin ? (
            <form className="login-form" onSubmit={submitLogin}>
              <label htmlFor="email">E-mail</label>
              <span className="p-input-icon-left login-field-icon">
                <i className="pi pi-envelope" aria-hidden="true" />
                <InputText
                  id="email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="nome@empresa.com.br"
                  required
                  autoComplete="username"
                  disabled={loading}
                />
              </span>

              <label htmlFor="password">Senha</label>
              <Password
                inputId="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Digite sua senha"
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
                icon={loading ? 'pi pi-spin pi-spinner' : 'pi pi-arrow-right'}
                iconPos="right"
                loading={false}
                type="submit"
                className="login-primary-button"
                disabled={loading}
              />

              <div className="login-secondary-actions">
                <Button label="Primeiro acesso" type="button" text onClick={() => changeMode('first-access')} disabled={loading} />
                <Button label="Esqueci minha senha" type="button" text onClick={() => changeMode('recover')} disabled={loading} />
              </div>
            </form>
          ) : (
            <form className="login-form" onSubmit={submitAccessRequest}>
              <label htmlFor="access-email">E-mail</label>
              <span className="p-input-icon-left login-field-icon">
                <i className="pi pi-envelope" aria-hidden="true" />
                <InputText
                  id="access-email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="nome@empresa.com.br"
                  required
                  autoComplete="email"
                  disabled={loading}
                />
              </span>
              <Button
                label={mode === 'first-access' ? 'Enviar link para definir senha' : 'Enviar link de recuperação'}
                icon={loading ? 'pi pi-spin pi-spinner' : 'pi pi-send'}
                iconPos="right"
                type="submit"
                className="login-primary-button"
                disabled={loading}
              />
              <Button label="Voltar ao login" icon="pi pi-arrow-left" type="button" text onClick={() => changeMode('login')} disabled={loading} />
            </form>
          )}

          {error && <Message severity="error" text={error} className="login-message" />}
          {success && <Message severity="success" text={success} className="login-message" />}

          <div className="login-security-note">
            <i className="pi pi-info-circle" aria-hidden="true" />
            <span>O acesso respeita o perfil e o escopo cadastrados na HUB. Nenhuma senha é compartilhada ou definida pela administração.</span>
          </div>
        </section>
      </section>
    </main>
  )
}
