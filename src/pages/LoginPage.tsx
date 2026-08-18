import { FormEvent, useState } from 'react'
import { supabase } from '../lib/supabase'

export function LoginPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setLoading(true)
    setMessage(null)
    setError(null)

    const { error: authError } = await supabase.auth.signInWithOtp({
      email: email.trim().toLowerCase(),
      options: {
        emailRedirectTo: window.location.origin,
        shouldCreateUser: true,
      },
    })

    if (authError) {
      setError(authError.message)
    } else {
      setMessage('Link de acesso enviado. Abra o e-mail e conclua a autenticação.')
    }
    setLoading(false)
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="brand brand-login">
          <span className="brand-mark">U</span>
          <div>
            <strong>BI Logístico</strong>
            <span>Unilog · V2</span>
          </div>
        </div>
        <h1>Acesso ao sistema</h1>
        <p>Use o mesmo e-mail cadastrado na HUB. O acesso será validado pelo perfil do supervisor.</p>
        <form onSubmit={handleSubmit}>
          <label htmlFor="email">E-mail</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="seu.email@empresa.com.br"
            required
            autoComplete="email"
          />
          <button className="button button-primary" type="submit" disabled={loading}>
            {loading ? 'Enviando…' : 'Enviar link de acesso'}
          </button>
        </form>
        {message && <div className="notice notice-success">{message}</div>}
        {error && <div className="notice notice-error">{error}</div>}
      </div>
    </div>
  )
}
