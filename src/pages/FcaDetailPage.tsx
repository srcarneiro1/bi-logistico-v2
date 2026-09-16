import { useEffect, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { Button } from 'primereact/button'
import { PageHeader } from '../components/PageHeader'
import { StatusBadge } from '../components/ui/Badge'
import { Chip } from '../components/ui/Chip'
import { DetailHero, DetailMetrics } from '../components/ui/DetailHero'
import { EmptyState, Skeleton } from '../components/ui/Feedback'
import { Panel, PanelHeader } from '../components/ui/Panel'
import { supabase } from '../lib/supabase'
import { deriveFcaDisplayStatus } from '../lib/fca'
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

  if(error)return <Panel><EmptyState tone="error" icon="error" title="Não foi possível carregar o FCA" description={error}/></Panel>
  if(!row)return <Panel><Skeleton lines={6}/></Panel>
  const displayStatus=deriveFcaDisplayStatus(row)
  const actions=[...(row.fca_acoes??[])].sort((a,b)=>a.ordem-b.ordem)
  const activeActions=actions.filter(a=>a.status!=='CANCELADO')
  const completedActions=activeActions.filter(a=>a.status==='CONCLUIDO').length
  const openActions=activeActions.filter(a=>a.status==='ABERTO'||a.status==='EM_ANDAMENTO').length

  return <section className="fca-page fca-detail-page">
    <PageHeader eyebrow="DETALHE DO REGISTRO" title={`FCA #${String(row.numero).padStart(5,'0')}`} description="Consulte o contexto, a causa, o plano de ação e a rastreabilidade do registro." actions={<><Button type="button" label="Voltar" icon="pi pi-arrow-left" outlined severity="secondary" onClick={goBack}/><Button type="button" label="Editar FCA" icon="pi pi-pencil" onClick={()=>navigate(`/fca/${row.id}/editar`)}/></>}/>
    {state?.justCreated&&<div className="notice notice-success" role="status">FCA #{String(state.justCreated).padStart(5,'0')} criado com sucesso.</div>}
    {state?.updated&&<div className="notice notice-success" role="status">FCA atualizado com sucesso.</div>}

    <DetailHero
      eyebrow={row.indicador_nome}
      title={row.depositante_nome}
      description={`Registro associado ao ${row.modulo_id} sob responsabilidade de ${row.supervisor_nome}.`}
      status={<StatusBadge status={displayStatus}/>} 
      meta={[
        {label:'Data da reunião',value:new Date(`${row.data_reuniao}T12:00:00`).toLocaleDateString('pt-BR')},
        {label:'Supervisor',value:row.supervisor_nome},
        {label:'Módulo',value:row.modulo_id},
        {label:'CNPJ',value:row.depositante_cnpj},
      ]}
    />

    <DetailMetrics items={[
      {key:'actions',label:'Ações válidas',value:activeActions.length},
      {key:'done',label:'Concluídas',value:completedActions,tone:completedActions===activeActions.length&&activeActions.length?'success':'neutral'},
      {key:'open',label:'Pendentes',value:openActions,tone:openActions?'warning':'neutral'},
      {key:'audit',label:'Eventos de auditoria',value:audit.length},
    ]}/>

    <Panel as="article" className="fca-cause-card"><PanelHeader eyebrow="ANÁLISE" title="Causa / desvio identificado"/><p className="fca-cause-copy">{row.causa}</p></Panel>

    <Panel as="article" className="fca-plan-panel"><PanelHeader eyebrow="EXECUÇÃO" title="Plano de ação" trailing={<Chip>{activeActions.length} ação(ões)</Chip>}/>{actions.length===0?<EmptyState icon="task_alt" title="Nenhuma ação cadastrada" description="Este FCA ainda não possui ações registradas."/>:<div className="fca-plan-list">{actions.map(acao=><div className={`fca-plan-item ${acao.status==='CANCELADO'?'action-cancelled':''}`} key={acao.id}><span className="fca-plan-marker">{String(acao.ordem).padStart(2,'0')}</span><div className="fca-plan-copy"><p>{acao.acao}</p><div className="fca-plan-meta"><span><i className="pi pi-user" aria-hidden="true"/>{acao.responsavel??'Sem responsável'}</span><span><i className="pi pi-calendar" aria-hidden="true"/>{acao.prazo?new Date(`${acao.prazo}T12:00:00`).toLocaleDateString('pt-BR'):'Sem prazo'}</span></div></div><StatusBadge status={acao.status} className="fca-plan-status"/></div>)}</div>}</Panel>

    <Panel as="article" className="fca-audit-panel"><PanelHeader eyebrow="RASTREABILIDADE" title="Histórico do registro" trailing={<Chip>{audit.length} evento(s)</Chip>}/>{audit.length?<div className="fca-audit-timeline">{audit.map(item=><div className="fca-audit-event" key={item.id}><strong>{item.acao.replaceAll('_',' ').toLocaleLowerCase('pt-BR')}</strong><span>{new Date(item.criado_em).toLocaleString('pt-BR')} · {item.usuario_email??'Sistema'}</span></div>)}</div>:<EmptyState icon="history" title="Sem eventos de auditoria" description="Ainda não há eventos de auditoria disponíveis para este registro."/>}</Panel>
  </section>
}
