import { type FormEvent, type ReactNode, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

type Mode = 'checking' | 'setup' | 'challenge' | 'ready'
type Enrollment = { factorId: string; qrCode: string; secret: string }

type Props = {
  required: boolean
  children: ReactNode
}

function friendlyError(message: string) {
  const lower = message.toLowerCase()
  if (lower.includes('invalid') || lower.includes('code')) return 'Código inválido ou expirado. Aguarde um novo código no autenticador e tente novamente.'
  if (lower.includes('factor')) return 'Não foi possível validar o autenticador. Tente novamente.'
  return 'Não foi possível concluir a autenticação em duas etapas. Tente novamente.'
}

export function MfaGate({ required, children }: Props) {
  const [mode, setMode] = useState<Mode>(required ? 'checking' : 'ready')
  const [factorId, setFactorId] = useState<string | null>(null)
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null)
  const [code, setCode] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function resolveState() {
    if (!required) {
      setMode('ready')
      return
    }

    setError(null)
    const [{ data: aal, error: aalError }, { data: factors, error: factorsError }] = await Promise.all([
      supabase.auth.mfa.getAuthenticatorAssuranceLevel(),
      supabase.auth.mfa.listFactors(),
    ])

    if (aalError || factorsError || !aal || !factors) {
      setError('Não foi possível verificar o segundo fator de autenticação.')
      setMode('challenge')
      return
    }

    if (aal.currentLevel === 'aal2') {
      setMode('ready')
      return
    }

    const verified = factors.totp.find(item => item.status === 'verified')
    if (verified) {
      setFactorId(verified.id)
      setMode('challenge')
      return
    }

    setFactorId(null)
    setEnrollment(null)
    setMode('setup')
  }

  useEffect(() => {
    void resolveState()
  }, [required])

  async function beginEnrollment() {
    setBusy(true)
    setError(null)
    try {
      const { data: factors, error: factorsError } = await supabase.auth.mfa.listFactors()
      if (factorsError) throw factorsError

      for (const pending of factors?.all.filter(item => item.factor_type === 'totp' && item.status === 'unverified') ?? []) {
        const { error: unenrollError } = await supabase.auth.mfa.unenroll({ factorId: pending.id })
        if (unenrollError) throw unenrollError
      }

      const { data, error: enrollError } = await supabase.auth.mfa.enroll({
        factorType: 'totp',
        friendlyName: 'BI Logístico',
      })
      if (enrollError) throw enrollError
      if (!data || !('totp' in data) || !data.totp) throw new Error('TOTP_ENROLLMENT_MISSING')

      setEnrollment({ factorId: data.id, qrCode: data.totp.qr_code, secret: data.totp.secret })
      setFactorId(data.id)
    } catch (enrollError) {
      setError(friendlyError(enrollError instanceof Error ? enrollError.message : ''))
    } finally {
      setBusy(false)
    }
  }

  async function verify(event: FormEvent) {
    event.preventDefault()
    const normalizedCode = code.replace(/\D/g, '').slice(0, 6)
    if (!factorId || normalizedCode.length !== 6) {
      setError('Informe o código de 6 dígitos exibido no seu aplicativo autenticador.')
      return
    }

    setBusy(true)
    setError(null)
    const { error: verifyError } = await supabase.auth.mfa.challengeAndVerify({ factorId, code: normalizedCode })
    if (verifyError) {
      setError(friendlyError(verifyError.message))
      setBusy(false)
      return
    }

    setCode('')
    await resolveState()
    setBusy(false)
  }

  async function signOut() {
    await supabase.auth.signOut()
  }

  if (!required || mode === 'ready') return <>{children}</>

  return <div className="mfa-page"><section className="mfa-card" aria-live="polite"><div className="mfa-badge">ACESSO ADMINISTRATIVO</div><h1>Verificação em duas etapas</h1>{mode === 'checking' ? <><p>Verificando o nível de segurança da sua sessão.</p><div className="mfa-loading"/></> : mode === 'setup' ? <>{enrollment ? <><p>Escaneie o QR Code com Google Authenticator, Microsoft Authenticator, Authy, 1Password ou outro aplicativo TOTP.</p><div className="mfa-qr"><img src={enrollment.qrCode} alt="QR Code para cadastrar o autenticador"/></div><div className="mfa-secret"><span>Não consegue escanear?</span><code>{enrollment.secret}</code></div><form onSubmit={verify} className="mfa-form"><label htmlFor="mfa-code">Código do autenticador</label><input id="mfa-code" value={code} onChange={event=>setCode(event.target.value.replace(/\D/g,'').slice(0,6))} inputMode="numeric" autoComplete="one-time-code" placeholder="000000" maxLength={6} autoFocus/><button className="button button-primary" type="submit" disabled={busy}>{busy?'Validando…':'Ativar e continuar'}</button></form></> : <><p>Como sua conta possui privilégio de Owner/Admin, é obrigatório cadastrar um segundo fator antes de acessar funções administrativas.</p><button className="button button-primary" type="button" onClick={()=>void beginEnrollment()} disabled={busy}>{busy?'Preparando…':'Configurar aplicativo autenticador'}</button></>}</> : <><p>Abra seu aplicativo autenticador e informe o código atual para concluir o acesso administrativo.</p><form onSubmit={verify} className="mfa-form"><label htmlFor="mfa-code">Código de 6 dígitos</label><input id="mfa-code" value={code} onChange={event=>setCode(event.target.value.replace(/\D/g,'').slice(0,6))} inputMode="numeric" autoComplete="one-time-code" placeholder="000000" maxLength={6} autoFocus/><button className="button button-primary" type="submit" disabled={busy}>{busy?'Validando…':'Verificar e continuar'}</button></form></>}{error&&<div className="notice notice-error">{error}</div>}<button className="button button-ghost mfa-signout" type="button" onClick={()=>void signOut()} disabled={busy}>Sair da conta</button><div className="mfa-note">O código muda periodicamente e nunca deve ser compartilhado. O BI não armazena o segredo do seu autenticador.</div></section></div>
}
