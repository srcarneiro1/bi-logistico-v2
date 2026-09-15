import { FormEvent, useState } from 'react'
import { Button } from 'primereact/button'
import { Message } from 'primereact/message'
import { Password } from 'primereact/password'
import { supabase } from '../lib/supabase'

const BRAND_LOGO = '/brand/unilog-logo-white-transparent.svg'

interface SetPasswordPageProps {
  onComplete: () => void
}

function cleanAuthUrl() {
  window.history.replaceState(null, '', '/')
}

export function SetPasswordPage({ onComplete }: SetPasswordPageProps) {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function submit(event: FormEvent) {
    event.preventDefault()
    setError(null)

    if (password.length < 8) {
      setError('A senha deve ter pelo menos 8 caracteres.')
      return
    }
    if (password !== confirmPassword) {
      setError('As senhas informadas não são iguais.')
      return
    }

    setLoading(true)
    const { error: updateError } = await supabase.auth.updateUser({ password })
    setLoading(false)

    if (updateError) {
      setError('Não foi possível definir a senha. Solicite um novo link e tente novamente.')
      return
    }

    cleanAuthUrl()
    onComplete()
  }

  async function cancel() {
    await supabase.auth.signOut()
    cleanAuthUrl()
    window.location.replace('/')
  }

  return (
    <main className="login-page">
      <section className="login-shell" aria-labelledby="set-password-heading">
        <aside className="login-brand-panel" aria-label="BI Logístico Unilog">
          <div className="login-brand-topline">
            <img src={BRAND_LOGO} alt="Unilog Express" />
            <span className="login-product-chip">BI Logístico V2</span>
          </div>

          <div className="login-brand-copy">
            <span className="login-overline login-overline-light">SEGURANÇA DA CONTA</span>
            <h1>Seu acesso começa por uma credencial pessoal e segura.</h1>
            <p>Defina sua senha para concluir a ativação e liberar o ambiente de indicadores e gestão operacional.</p>
          </div>

          <div className="login-proof">
            <span><i className="pi pi-shield" aria-hidden="true" /> Link validado</span>
            <span><i className="pi pi-lock" aria-hidden="true" /> Senha pessoal</span>
          </div>
        </aside>

        <section className="login-form-panel">
          <div className="login-heading">
            <span className="login-overline">DEFINIÇÃO DE SENHA</span>
            <h2 id="set-password-heading">Definir nova senha</h2>
            <p>Crie uma senha com pelo menos 8 caracteres. Ela será usada nos próximos acessos.</p>
          </div>

          <form className="login-form" onSubmit={submit}>
            <label htmlFor="new-password">Nova senha</label>
            <Password
              inputId="new-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Mínimo de 8 caracteres"
              required
              minLength={8}
              autoComplete="new-password"
              feedback={false}
              toggleMask
              disabled={loading}
              className="login-password"
              inputClassName="login-password-input"
            />

            <label htmlFor="confirm-password">Confirmar senha</label>
            <Password
              inputId="confirm-password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder="Repita a nova senha"
              required
              minLength={8}
              autoComplete="new-password"
              feedback={false}
              toggleMask
              disabled={loading}
              className="login-password"
              inputClassName="login-password-input"
            />

            <Button
              label="Definir senha e entrar"
              icon={loading ? 'pi pi-spin pi-spinner' : 'pi pi-check'}
              iconPos="right"
              type="submit"
              className="login-primary-button"
              disabled={loading}
            />
            <Button
              label="Cancelar e voltar ao login"
              icon="pi pi-arrow-left"
              type="button"
              text
              onClick={() => void cancel()}
              disabled={loading}
            />
          </form>

          {error && <Message severity="error" text={error} className="login-message" />}

          <div className="login-security-note">
            <i className="pi pi-info-circle" aria-hidden="true" />
            <span>O link recebido por e-mail é temporário e serve apenas para validar sua identidade antes da troca de senha.</span>
          </div>
        </section>
      </section>
    </main>
  )
}
