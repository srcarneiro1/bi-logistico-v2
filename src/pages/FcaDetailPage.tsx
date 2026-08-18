import { useEffect, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { deriveFcaStatus, isFcaOverdue } from '../lib/fca'
import type { FcaWithActions } from '../types/fca'

export function FcaDetailPage() {
  const { id } = useParams()
  const location = useLocation()
  const [row, setRow] = useState<FcaWithActions | null>(null)
  const [audit, setAudit] = useState<Array<{ id: number; acao: string; usuario_email: string | null; criado_em: string }>>([])
  const [error, setError] = useState<string | null>(null)
  const justCreated = (location.state as { justCreated?: number } | null)?.justCreated

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
  if (!row) return <div className="panel">Carregando FCA…</div>
  const derived = deriveFcaStatus(row)
  const overdue = isFcaOverdue(row)

  return (
    <section>
      <div className="page-header page-header-row"><div><span className="eyebrow">FCA #{String(row.numero).padStart(5, '0')}</span><h1>{row.depositante_nome}</h1><p>{row.indicador_nome} · {row.modulo_id}</p></div><Link className="button" to="/fca">Voltar</Link></div>
      {justCreated && <div className="notice notice-success">FCA #{String(justCreated).padStart(5, '0')} criado com sucesso.</div>}
      <div className="detail-grid">
        <article className="panel"><div className="section-title-row"><h2>Identificação</h2><span className={`status-badge status-${overdue ? 'VENCIDO' : derived}`}>{overdue ? 'VENCIDO' : derived.replace('_', ' ')}</span></div><dl className="details-grid"><div><dt>Data da reunião</dt><dd>{new Date(`${row.data_reuniao}T12:00:00`).toLocaleDateString('pt-BR')}</dd></div><div><dt>Supervisor</dt><dd>{row.supervisor_nome}</dd></div><div><dt>Depositante</dt><dd>{row.depositante_nome}</dd></div><div><dt>CNPJ</dt><dd>{row.depositante_cnpj}</dd></div></dl></article>
        <article className="panel"><h2>Causa</h2><p className="long-text">{row.causa}</p></article>
      </div>
      <article className="panel panel-spaced"><h2>Plano de ação</h2><div className="detail-actions">{row.fca_acoes.length === 0 && <p>Nenhuma ação cadastrada.</p>}{row.fca_acoes.sort((a,b) => a.ordem-b.ordem).map((acao) => <div className="detail-action" key={acao.id}><div><strong>{String(acao.ordem).padStart(2,'0')}</strong><p>{acao.acao}</p></div><div><span>{acao.responsavel ?? 'Sem responsável'}</span><span>{acao.prazo ? new Date(`${acao.prazo}T12:00:00`).toLocaleDateString('pt-BR') : 'Sem prazo'}</span><span className={`status-badge status-${acao.status}`}>{acao.status.replace('_',' ')}</span></div></div>)}</div></article>
      <article className="panel panel-spaced"><h2>Histórico</h2><div className="timeline">{audit.map((item) => <div key={item.id}><strong>{item.acao.replaceAll('_',' ')}</strong><span>{new Date(item.criado_em).toLocaleString('pt-BR')} · {item.usuario_email ?? 'Sistema'}</span></div>)}{audit.length === 0 && <p>Sem eventos de auditoria disponíveis.</p>}</div></article>
    </section>
  )
}
