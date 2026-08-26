import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { PageHeader } from '../components/PageHeader'
import { StatusBadge } from '../components/ui/Badge'
import { supabase } from '../lib/supabase'
import { deriveFcaStatus, isFcaOverdue } from '../lib/fca'
import { getFcaReturnContext, prepareFcaReturnTarget } from '../lib/navigationContext'
import type { FcaWithActions } from '../types/fca'

export function FcaDetailPage() {
  const { id } = useParams()
  const location = useLocation()
  const navigate=useNavigate()
  const [row, setRow] = useState<FcaWithActions | null>(null)
  const [audit, setAudit] = useState<Array<{ id: number; acao: string; usuario_email: string | null; criado_em: string }>>([])
  const [error, setError] = useState<string | null>(null)
  const state=location.state as { justCreated?: number; updated?:boolean } | null

  useEffect(() => {
    if (!id) return
    void Promise.all([
      supabase.from('fca').select(`*, fca_acoes(*)`).eq('id', id).single(),
      supabase.from('auditoria').select('id,acao,usuario_email,criado_em').eq('fca_id', id).order('criado_em', { ascending: false }),
    ]).then(([fcaResult, auditResult]) => {
      if (fcaResult.error) throw fcaResult.error
      if (auditResult.error) throw auditResult.error
      setRow(fcaResult.data as unknown as FcaWithActions)
      setAudit(auditResult.data ?? [])
    }).catch((err: unknown) => setError(err instanceof Error ? err.message : 'Erro ao carregar FCA.'))
  }, [id])

  function goBack(){navigate(prepareFcaReturnTarget(getFcaReturnContext()))}

  if (error) return <div className="notice notice-error">{error}</div>
  if (!row) return <div className="panel loading-panel">Carregando FCA…</div>
  const derived = deriveFcaStatus(row)
  const overdue = isFcaOverdue(row)
  const displayStatus=overdue?'VENCIDO':derived
  const actions=[...(row.fca_acoes??[])].sort((a,b)=>a.ordem-b.ordem)
  const activeActions=actions.filter(a=>a.status!=='CANCELADO')
  const completedActions=activeActions.filter(a=>a.status==='CONCLUIDO').length
  const openActions=activeActions.filter(a=>a.status==='ABERTO'||a.status==='EM_ANDAMENTO').length

  return <section className="fca-page fca-detail-page">
    <PageHeader eyebrow="DETALHE DO REGISTRO" title={`FCA #${String(row.numero).padStart(5,'0')}`} description="Consulte o contexto, a causa, o plano de ação e a rastreabilidade do registro." actions={<><button className="button" type="button" onClick={goBack}><span className="material-symbols-rounded">arrow_back</span>Voltar</button><Link className="button button-primary" to={`/fca/${row.id}/editar`}><span className="material-symbols-rounded">edit</span>Editar FCA</Link></>}/>
    {state?.justCreated&&<div className="notice notice-success">FCA #{String(state.justCreated).padStart(5,'0')} criado com sucesso.</div>}
    {state?.updated&&<div className="notice notice-success">FCA atualizado com sucesso.</div>}

    <article className="fca-detail-hero">
      <div className="fca-detail-identity"><div className="fca-detail-kicker"><span>{row.indicador_nome}</span><StatusBadge status={displayStatus}/></div><h2>{row.depositante_nome}</h2><p>Registro associado ao {row.modulo_id} sob responsabilidade de {row.supervisor_nome}.</p></div>
      <dl className="fca-detail-meta"><div><dt>Data da reunião</dt><dd>{new Date(`${row.data_reuniao}T12:00:00`).toLocaleDateString('pt-BR')}</dd></div><div><dt>Supervisor</dt><dd>{row.supervisor_nome}</dd></div><div><dt>Módulo</dt><dd>{row.modulo_id}</dd></div><div><dt>CNPJ</dt><dd>{row.depositante_cnpj}</dd></div></dl>
    </article>

    <div className="fca-detail-grid-preline">
      <article className="panel fca-cause-card"><div className="fca-card-head"><span className="fca-card-icon"><span className="material-symbols-rounded">troubleshoot</span></span><div><span>Análise</span><h2>Causa / desvio identificado</h2></div></div><p className="fca-cause-copy">{row.causa}</p></article>
      <article className="panel fca-action-summary"><div className="fca-card-head"><span className="fca-card-icon"><span className="material-symbols-rounded">task_alt</span></span><div><span>Execução</span><h2>Resumo do plano</h2></div></div><div className="fca-action-summary-grid"><div><span>Ações válidas</span><strong>{activeActions.length}</strong></div><div><span>Concluídas</span><strong>{completedActions}</strong></div><div><span>Pendentes</span><strong>{openActions}</strong></div><div><span>Auditorias</span><strong>{audit.length}</strong></div></div></article>
    </div>

    <article className="panel panel-spaced fca-plan-panel"><div className="panel-head"><div><span className="panel-eyebrow">EXECUÇÃO</span><h2>Plano de ação</h2></div><span className="panel-chip">{activeActions.length} ação(ões)</span></div>{actions.length===0?<div className="fca-plan-empty">Nenhuma ação cadastrada.</div>:<div className="fca-plan-list">{actions.map(acao=><div className={`fca-plan-item ${acao.status==='CANCELADO'?'action-cancelled':''}`} key={acao.id}><span className="fca-plan-marker">{String(acao.ordem).padStart(2,'0')}</span><div className="fca-plan-copy"><p>{acao.acao}</p><div className="fca-plan-meta"><span><span className="material-symbols-rounded">person</span>{acao.responsavel??'Sem responsável'}</span><span><span className="material-symbols-rounded">event</span>{acao.prazo?new Date(`${acao.prazo}T12:00:00`).toLocaleDateString('pt-BR'):'Sem prazo'}</span></div></div><StatusBadge status={acao.status} className="fca-plan-status"/></div>)}</div>}</article>

    <article className="panel panel-spaced fca-audit-panel"><div className="panel-head"><div><span className="panel-eyebrow">RASTREABILIDADE</span><h2>Histórico do registro</h2></div><span className="panel-chip">{audit.length} evento(s)</span></div>{audit.length?<div className="fca-audit-timeline">{audit.map(item=><div className="fca-audit-event" key={item.id}><strong>{item.acao.replaceAll('_',' ').toLocaleLowerCase('pt-BR')}</strong><span>{new Date(item.criado_em).toLocaleString('pt-BR')} · {item.usuario_email??'Sistema'}</span></div>)}</div>:<div className="fca-plan-empty">Sem eventos de auditoria disponíveis.</div>}</article>
  </section>
}
