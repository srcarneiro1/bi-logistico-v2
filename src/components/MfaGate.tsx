import { type FormEvent, type ReactNode, useEffect, useState } from 'react'
import { Button } from 'primereact/button'
import { Card } from 'primereact/card'
import { InputText } from 'primereact/inputtext'
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

  const title = mode === 'setup' ? (enrollment ? 'Ative a verificação em duas etapas' : 'Proteja seu acesso administrativo') : mode === 'checking' ? 'Validando segurança da sessão' : 'Confirme sua identidade'
  const description = mode === 'setup'
    ? enrollment
      ? 'Escaneie o QR Code no seu aplicativo autenticador e informe o código gerado para concluir a configuração.'
      : 'Contas Owner e Administrador precisam de um segundo fator antes de acessar funções administrativas.'
    : mode === 'checking'
      ? 'Estamos confirmando o nível de segurança exigido para este acesso.'
      : 'Informe o código atual do seu aplicativo autenticador para continuar.'

  return <div className="mfa-page">
    <Card className="mfa-card">
      <div className="mfa-security-header">
        <div className="mfa-security-icon"><i className="pi pi-shield" aria-hidden="true"/></div>
        <div className="mfa-security-copy">
          <span className="mfa-badge">ACESSO ADMINISTRATIVO</span>
          <h1>{title}</h1>
          <p>{description}</p>
        </div>
      </div>

      {mode === 'checking' ? <div className="mfa-checking" role="status"><i className="pi pi-spin pi-spinner" aria-hidden="true"/><span>Verificando autenticação...</span></div> : mode === 'setup' ? <>{enrollment ? <>
        <div className="mfa-qr"><img src={enrollment.qrCode} alt="QR Code para cadastrar o autenticador"/></div>
        <div className="mfa-secret"><span>Não consegue escanear?</span><code>{enrollment.secret}</code></div>
        <form onSubmit={verify} className="mfa-form">
          <label htmlFor="mfa-code">Código de 6 dígitos</label>
          <InputText id="mfa-code" value={code} onChange={event=>setCode(event.target.value.replace(/\D/g,'').slice(0,6))} inputMode="numeric" autoComplete="one-time-code" placeholder="000000" maxLength={6} autoFocus/>
          <Button label="Ativar e continuar" icon="pi pi-check" type="submit" loading={busy}/>
        </form>
      </> : <Button label="Configurar aplicativo autenticador" type="button" icon="pi pi-mobile" loading={busy} onClick={()=>void beginEnrollment()} className="mfa-primary-action"/>}</> : <form onSubmit={verify} className="mfa-form">
        <label htmlFor="mfa-code">Código de 6 dígitos</label>
        <InputText id="mfa-code" value={code} onChange={event=>setCode(event.target.value.replace(/\D/g,'').slice(0,6))} inputMode="numeric" autoComplete="one-time-code" placeholder="000000" maxLength={6} autoFocus/>
        <Button label="Verificar e continuar" icon="pi pi-arrow-right" iconPos="right" type="submit" loading={busy}/>
      </form>}

      {error&&<div className="mfa-error" role="alert"><i className="pi pi-exclamation-circle" aria-hidden="true"/><span>{error}</span></div>}

      <div className="mfa-card-footer">
        <div className="mfa-note"><i className="pi pi-lock" aria-hidden="true"/><span>O código muda periodicamente e nunca deve ser compartilhado. O BI não armazena o segredo do seu autenticador.</span></div>
        <Button label="Sair da conta" type="button" text severity="secondary" icon="pi pi-sign-out" className="mfa-signout" onClick={()=>void signOut()} disabled={busy}/>
      </div>
    </Card>
  </div>
}
