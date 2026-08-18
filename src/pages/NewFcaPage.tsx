import { FormEvent, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import type { HubBootstrap } from '../types/hub'
import type { FcaActionStatus, NewFcaAction } from '../types/fca'
import { createFca } from '../lib/fca'

const emptyAction = (): NewFcaAction => ({ acao: '', responsavel: '', prazo: '', status: 'ABERTO' })

export function NewFcaPage({ hub }: { hub: HubBootstrap }) {
  const navigate = useNavigate()
  const isAdmin = hub.profile.perfil === 'ADMIN'
  const defaultSupervisorId = isAdmin ? '' : (hub.profile.supervisorId ?? '')
  const [dataReuniao, setDataReuniao] = useState(new Date().toISOString().slice(0, 10))
  const [supervisorId, setSupervisorId] = useState(defaultSupervisorId)
  const [moduloId, setModuloId] = useState('')
  const [depositanteCnpj, setDepositanteCnpj] = useState('')
  const [indicadorCodigo, setIndicadorCodigo] = useState('')
  const [causa, setCausa] = useState('')
  const [acoes, setAcoes] = useState<NewFcaAction[]>([emptyAction()])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const modules = useMemo(() => {
    const ids = hub.supervisorModules
      .filter((item) => !supervisorId || item.supervisorId === supervisorId)
      .map((item) => item.moduloId)
    return Array.from(new Set(ids)).sort()
  }, [hub.supervisorModules, supervisorId])

  const depositantes = useMemo(() => hub.depositantes.filter((item) => {
    if (supervisorId && item.supervisorId !== supervisorId && item.moduloId !== moduloId) return false
    if (moduloId && item.moduloId !== moduloId) return false
    return true
  }).sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR')), [hub.depositantes, supervisorId, moduloId])

  const indicadores = useMemo(() => hub.indicadores
    .filter((item) => item.grupo.trim().toUpperCase() === 'KPI')
    .sort((a, b) => a.indicador.localeCompare(b.indicador, 'pt-BR')), [hub.indicadores])

  function changeSupervisor(value: string) {
    setSupervisorId(value)
    setModuloId('')
    setDepositanteCnpj('')
  }

  function changeModule(value: string) {
    setModuloId(value)
    setDepositanteCnpj('')
  }

  function updateAction(index: number, field: keyof NewFcaAction, value: string) {
    setAcoes((current) => current.map((acao, i) => i === index ? { ...acao, [field]: value } : acao))
  }

  function removeAction(index: number) {
    setAcoes((current) => current.length === 1 ? current : current.filter((_, i) => i !== index))
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)

    const depositante = depositantes.find((item) => item.cnpj === depositanteCnpj)
    const indicador = indicadores.find((item) => item.codigo === indicadorCodigo)
    const supervisor = hub.supervisors.find((item) => item.supervisorId === depositante?.supervisorId)
    if (!depositante || !indicador || !supervisor || !moduloId) {
      setError('Preencha supervisor, módulo, depositante e indicador.')
      return
    }
    if (!causa.trim()) {
      setError('Informe a causa do FCA.')
      return
    }
    const validActions = acoes.filter((acao) => acao.acao.trim())
    if (acoes.some((acao) => !acao.acao.trim() && (acao.responsavel || acao.prazo))) {
      setError('Há uma ação incompleta. Informe a descrição ou remova a linha.')
      return
    }

    const substitution = hub.substituicoes.find((item) => item.ativo && item.moduloId === moduloId && (
      item.supervisorTitularId === supervisorId || item.supervisorSubstitutoId === supervisorId
    ))

    setSaving(true)
    try {
      const created = await createFca({
        dataReuniao,
        supervisorId: depositante.supervisorId,
        supervisorNome: supervisor.supervisor,
        moduloId,
        depositanteCnpj: depositante.cnpj,
        depositanteNome: depositante.nome,
        indicadorCodigo: indicador.codigo,
        indicadorNome: indicador.indicador,
        causa: causa.trim(),
        substituicaoId: substitution?.substituicaoId ?? null,
        substitutoId: substitution?.supervisorSubstitutoId ?? null,
        substitutoNome: substitution?.supervisorSubstituto ?? null,
        acoes: validActions,
      })
      navigate(`/fca/${created.id}`, { state: { justCreated: created.numero } })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível salvar o FCA.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <section>
      <div className="page-header page-header-row">
        <div>
          <span className="eyebrow">FCA · NOVO</span>
          <h1>Novo FCA</h1>
          <p>Os dados de supervisor, módulo, depositante e indicador vêm da HUB.</p>
        </div>
        <Link className="button" to="/fca">Voltar</Link>
      </div>

      <form className="form-panel" onSubmit={handleSubmit}>
        <div className="form-section">
          <h2>Identificação</h2>
          <div className="form-grid form-grid-3">
            <div><label>Data da reunião</label><input type="date" value={dataReuniao} onChange={(e) => setDataReuniao(e.target.value)} required /></div>
            <div>
              <label>Supervisor</label>
              <select value={supervisorId} onChange={(e) => changeSupervisor(e.target.value)} disabled={!isAdmin} required>
                <option value="">Selecione</option>
                {hub.supervisors.map((item) => <option key={item.supervisorId} value={item.supervisorId}>{item.nomeExibicao}</option>)}
              </select>
            </div>
            <div>
              <label>Módulo</label>
              <select value={moduloId} onChange={(e) => changeModule(e.target.value)} required>
                <option value="">Selecione</option>
                {modules.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
            </div>
            <div className="span-2">
              <label>Depositante</label>
              <select value={depositanteCnpj} onChange={(e) => setDepositanteCnpj(e.target.value)} required>
                <option value="">Selecione pelo nome</option>
                {depositantes.map((item) => <option key={item.cnpj} value={item.cnpj}>{item.nome} · {item.cnpj}</option>)}
              </select>
            </div>
            <div>
              <label>Indicador</label>
              <select value={indicadorCodigo} onChange={(e) => setIndicadorCodigo(e.target.value)} required>
                <option value="">Selecione</option>
                {indicadores.map((item) => <option key={item.codigo} value={item.codigo}>{item.indicador}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div className="form-section">
          <h2>Análise da causa</h2>
          <label>Causa / desvio identificado</label>
          <textarea value={causa} onChange={(e) => setCausa(e.target.value)} rows={6} placeholder="Descreva o problema e a causa identificada…" required />
        </div>

        <div className="form-section">
          <div className="section-title-row"><h2>Plano de ação</h2><button type="button" className="button" onClick={() => setAcoes((current) => [...current, emptyAction()])}>+ Adicionar ação</button></div>
          <div className="actions-stack">
            {acoes.map((acao, index) => (
              <div className="action-card" key={index}>
                <div className="action-card-title"><strong>Ação {String(index + 1).padStart(2, '0')}</strong><button type="button" className="text-button" onClick={() => removeAction(index)} disabled={acoes.length === 1}>Remover</button></div>
                <div className="form-grid form-grid-action">
                  <div className="span-2"><label>Ação</label><textarea rows={3} value={acao.acao} onChange={(e) => updateAction(index, 'acao', e.target.value)} /></div>
                  <div><label>Responsável</label><input value={acao.responsavel} onChange={(e) => updateAction(index, 'responsavel', e.target.value)} /></div>
                  <div><label>Prazo</label><input type="date" value={acao.prazo} onChange={(e) => updateAction(index, 'prazo', e.target.value)} /></div>
                  <div><label>Status</label><select value={acao.status} onChange={(e) => updateAction(index, 'status', e.target.value as FcaActionStatus)}><option value="ABERTO">Aberto</option><option value="EM_ANDAMENTO">Em andamento</option><option value="CONCLUIDO">Concluído</option><option value="CANCELADO">Cancelado</option></select></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {error && <div className="notice notice-error">{error}</div>}
        <div className="form-actions"><Link className="button" to="/fca">Cancelar</Link><button className="button button-primary" type="submit" disabled={saving}>{saving ? 'Salvando…' : 'Salvar FCA'}</button></div>
      </form>
    </section>
  )
}
