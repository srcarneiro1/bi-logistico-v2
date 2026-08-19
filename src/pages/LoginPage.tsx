import { FormEvent, useState } from 'react'
import { supabase } from '../lib/supabase'

export function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setLoading(true)
    setError(null)

    const { error: authError } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    })

    if (authError) setError(authError.message)
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
        <p>Entre com o mesmo e-mail cadastrado na HUB.</p>
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

          <label htmlFor="password">Senha</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Sua senha"
            required
            autoComplete="current-password"
          />

          <button className="button button-primary" type="submit" disabled={loading}>
            {loading ? 'Entrando…' : 'Entrar'}
          </button>
        </form>
        {error && <div className="notice notice-error">{error}</div>}
      </div>
    </div>
  )
}
