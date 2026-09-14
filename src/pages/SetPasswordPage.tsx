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
      <div className="login-shell">
        <section className="login-brand-panel" aria-label="BI Logístico Unilog">
          <img src={BRAND_LOGO} alt="Unilog Express" />
          <div>
            <span>PERFORMANCE OPERACIONAL</span>
            <h1>BI Logístico</h1>
            <p>Defina sua senha pessoal para concluir o acesso ao ambiente.</p>
          </div>
          <small>Unilog Express · V2</small>
        </section>

        <section className="login-card" aria-labelledby="set-password-heading">
          <div className="login-heading">
            <span>SEGURANÇA DA CONTA</span>
            <h2 id="set-password-heading">Definir nova senha</h2>
            <p>Crie uma senha com pelo menos 8 caracteres. Ela será usada nos próximos acessos.</p>
          </div>

          <form onSubmit={submit}>
            <label htmlFor="new-password">Nova senha</label>
            <Password
              inputId="new-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Nova senha"
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
              loading={loading}
              type="submit"
              className="button-primary login-submit"
            />
            <Button
              label="Cancelar e voltar ao login"
              type="button"
              className="button-ghost"
              onClick={() => void cancel()}
              disabled={loading}
            />
          </form>

          {error && <Message severity="error" text={error} className="login-message" />}

          <div className="login-security-note">
            O link recebido por e-mail é temporário e serve apenas para validar a identidade antes da troca de senha.
          </div>
        </section>
      </div>
    </main>
  )
}
