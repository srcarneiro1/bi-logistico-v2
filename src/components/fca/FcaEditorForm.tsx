import type { FormEvent } from 'react'
import { Link } from 'react-router-dom'
import type { FcaActionStatus } from '../../types/fca'
import type { HubBootstrap } from '../../types/hub'

export interface FcaEditorAction {
  id?: number
  acao: string
  responsavel: string
  prazo: string
  status: FcaActionStatus
}

interface FcaEditorFormProps {
  mode: 'new' | 'edit'
  supervisors: HubBootstrap['supervisors']
  modules: string[]
  depositantes: HubBootstrap['depositantes']
  indicadores: HubBootstrap['indicadores']
  canChooseSupervisor: boolean
  dataReuniao: string
  supervisorId: string
  moduloId: string
  depositanteCnpj: string
  indicadorCodigo: string
  causa: string
  acoes: FcaEditorAction[]
  saving: boolean
  error: string | null
  cancelTo: string
  onSubmit: (event: FormEvent) => void
  onDataReuniaoChange: (value: string) => void
  onSupervisorChange: (value: string) => void
  onModuloChange: (value: string) => void
  onDepositanteChange: (value: string) => void
  onIndicadorChange: (value: string) => void
  onCausaChange: (value: string) => void
  onActionChange: (index: number, field: keyof FcaEditorAction, value: string) => void
  onAddAction: () => void
  onRemoveAction: (index: number) => void
}

export function FcaEditorForm({
  mode,supervisors,modules,depositantes,indicadores,canChooseSupervisor,
  dataReuniao,supervisorId,moduloId,depositanteCnpj,indicadorCodigo,causa,acoes,saving,error,cancelTo,
  onSubmit,onDataReuniaoChange,onSupervisorChange,onModuloChange,onDepositanteChange,onIndicadorChange,onCausaChange,onActionChange,onAddAction,onRemoveAction,
}:FcaEditorFormProps){
  const editing=mode==='edit'
  return <form className="fca-form" onSubmit={onSubmit}>
    <div className="form-section">
      <div className="form-section-heading"><span className="material-symbols-rounded" aria-hidden="true">badge</span><div><h2>Identificação</h2><p>{editing?'Revise':'Defina'} o contexto operacional do registro.</p></div></div>
      <div className="form-grid form-grid-3">
        <div><label>Data da reunião</label><input type="date" value={dataReuniao} onChange={event=>onDataReuniaoChange(event.target.value)} required/></div>
        <div><label>Supervisor titular</label><select value={supervisorId} onChange={event=>onSupervisorChange(event.target.value)} disabled={!canChooseSupervisor} required><option value="">Selecione</option>{supervisors.map(supervisor=><option key={supervisor.supervisorId} value={supervisor.supervisorId}>{supervisor.nomeExibicao}</option>)}</select></div>
        <div><label>Módulo</label><select value={moduloId} onChange={event=>onModuloChange(event.target.value)} required><option value="">Selecione</option>{modules.map(module=><option key={module}>{module}</option>)}</select></div>
        <div className="span-2"><label>Depositante</label><select value={depositanteCnpj} onChange={event=>onDepositanteChange(event.target.value)} required><option value="">Selecione pelo nome</option>{depositantes.map(depositante=><option key={depositante.cnpj} value={depositante.cnpj}>{depositante.nome} · {depositante.cnpj}</option>)}</select></div>
        <div><label>Indicador</label><select value={indicadorCodigo} onChange={event=>onIndicadorChange(event.target.value)} required><option value="">Selecione</option>{indicadores.map(indicador=><option key={indicador.codigo} value={indicador.codigo}>{indicador.indicador}</option>)}</select></div>
      </div>
    </div>

    <div className="form-section">
      <div className="form-section-heading"><span className="material-symbols-rounded" aria-hidden="true">troubleshoot</span><div><h2>Análise da causa</h2><p>{editing?'Atualize':'Documente'} o desvio e a causa com contexto suficiente para auditoria.</p></div></div>
      <label>Causa / desvio identificado</label>
      <textarea value={causa} onChange={event=>onCausaChange(event.target.value)} rows={6} placeholder={editing?undefined:'Descreva o problema, o impacto e a causa identificada…'} required/>
    </div>

    <div className="form-section">
      <div className="section-title-row form-section-heading-row">
        <div className="form-section-heading"><span className="material-symbols-rounded" aria-hidden="true">task_alt</span><div><h2>Plano de ação</h2><p>{editing?'Mantenha':'Defina'} ações, responsáveis, prazos e acompanhamento.</p></div></div>
        <button type="button" className="add-action-button" onClick={onAddAction}><span className="material-symbols-rounded" aria-hidden="true">add</span>Nova ação</button>
      </div>
      <div className="actions-stack">{acoes.map((acao,index)=><div className="action-card" key={acao.id??`new-${index}`}>
        <div className="action-card-title"><span className="action-number">{String(index+1).padStart(2,'0')}</span><strong>Ação</strong><button type="button" className="action-remove" onClick={()=>onRemoveAction(index)} disabled={!editing&&acoes.length===1}><span className="material-symbols-rounded" aria-hidden="true">delete</span>Remover</button></div>
        <div className="form-grid form-grid-action">
          <div className="span-2"><label>Descrição da ação</label><textarea rows={3} value={acao.acao} onChange={event=>onActionChange(index,'acao',event.target.value)}/></div>
          <div><label>Responsável</label><input value={acao.responsavel} onChange={event=>onActionChange(index,'responsavel',event.target.value)}/></div>
          <div><label>Prazo</label><input type="date" value={acao.prazo} onChange={event=>onActionChange(index,'prazo',event.target.value)}/></div>
          <div><label>Status</label><select value={acao.status} onChange={event=>onActionChange(index,'status',event.target.value)}><option value="ABERTO">Aberto</option><option value="EM_ANDAMENTO">Em andamento</option><option value="CONCLUIDO">Concluído</option><option value="CANCELADO">Cancelado</option></select></div>
        </div>
      </div>)}</div>
    </div>

    {error&&<div className="notice notice-error" role="alert">{error}</div>}
    <div className="form-actions sticky-form-actions"><Link className="button" to={cancelTo}>Cancelar</Link><button className="button button-primary" type="submit" disabled={saving}>{saving?'Salvando…':editing?'Salvar alterações':'Salvar FCA'}</button></div>
  </form>
}
