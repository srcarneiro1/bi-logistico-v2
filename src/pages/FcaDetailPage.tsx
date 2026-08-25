import { useEffect, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { PageHeader } from '../components/PageHeader'
import { supabase } from '../lib/supabase'
import { deriveFcaStatus, isFcaOverdue } from '../lib/fca'
import type { FcaWithActions } from '../types/fca'

export function FcaDetailPage() {
  const { id } = useParams()
  const location = useLocation()
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

  if (error) return <div className="notice notice-error">{error}</div>
  if (!row) return <div className="panel loading-panel">Carregando FCA…</div>
  const derived = deriveFcaStatus(row)
  const overdue = isFcaOverdue(row)
  const actions=[...(row.fca_acoes??[])].sort((a,b)=>a.ordem-b.ordem)

  return <section className="fca-page fca-detail-page">
    <PageHeader eyebrow={`FCA #${String(row.numero).padStart(5,'0')}`} title={row.depositante_nome} description={`${row.indicador_nome} · ${row.modulo_id} · ${row.supervisor_nome}`} actions={<><Link className="button" to="/fca"><span className="material-symbols-rounded">arrow_back</span>Voltar</Link><Link className="button button-primary" to={`/fca/${row.id}/editar`}><span className="material-symbols-rounded">edit</span>Editar FCA</Link></>}/>
    {state?.justCreated&&<div className="notice notice-success">FCA #{String(state.justCreated).padStart(5,'0')} criado com sucesso.</div>}
    {state?.updated&&<div className="notice notice-success">FCA atualizado com sucesso.</div>}
    <div className="detail-grid"><article className="panel"><div className="section-title-row"><h2>Identificação</h2><span className={`status-badge status-${overdue?'VENCIDO':derived}`}>{overdue?'VENCIDO':derived.replace('_',' ')}</span></div><dl className="details-grid"><div><dt>Data da reunião</dt><dd>{new Date(`${row.data_reuniao}T12:00:00`).toLocaleDateString('pt-BR')}</dd></div><div><dt>Supervisor</dt><dd>{row.supervisor_nome}</dd></div><div><dt>Depositante</dt><dd>{row.depositante_nome}</dd></div><div><dt>CNPJ</dt><dd>{row.depositante_cnpj}</dd></div></dl></article><article className="panel"><h2>Causa</h2><p className="long-text">{row.causa}</p></article></div>
    <article className="panel panel-spaced"><div className="panel-head"><div><span className="panel-eyebrow">EXECUÇÃO</span><h2>Plano de ação</h2></div><span className="panel-chip">{actions.filter(a=>a.status!=='CANCELADO').length} ação(ões)</span></div><div className="detail-actions">{actions.length===0&&<p>Nenhuma ação cadastrada.</p>}{actions.map(acao=><div className={`detail-action ${acao.status==='CANCELADO'?'action-cancelled':''}`} key={acao.id}><div><strong>{String(acao.ordem).padStart(2,'0')}</strong><p>{acao.acao}</p></div><div><span>{acao.responsavel??'Sem responsável'}</span><span>{acao.prazo?new Date(`${acao.prazo}T12:00:00`).toLocaleDateString('pt-BR'):'Sem prazo'}</span><span className={`status-badge status-${acao.status}`}>{acao.status.replace('_',' ')}</span></div></div>)}</div></article>
    <article className="panel panel-spaced"><div className="panel-head"><div><span className="panel-eyebrow">RASTREABILIDADE</span><h2>Histórico</h2></div></div><div className="timeline">{audit.map(item=><div key={item.id}><strong>{item.acao.replaceAll('_',' ')}</strong><span>{new Date(item.criado_em).toLocaleString('pt-BR')} · {item.usuario_email??'Sistema'}</span></div>)}{audit.length===0&&<p>Sem eventos de auditoria disponíveis.</p>}</div></article>
  </section>
}
