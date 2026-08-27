import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { PageHeader } from '../components/PageHeader'
import { StatusBadge } from '../components/ui/Badge'
import { Chip } from '../components/ui/Chip'
import { EmptyState, Skeleton } from '../components/ui/Feedback'
import { PageToolbar } from '../components/ui/PageToolbar'
import { Panel, PanelHeader } from '../components/ui/Panel'
import { SearchField } from '../components/ui/SearchField'
import { SummaryMetrics, type SummaryMetricItem } from '../components/ui/SummaryMetrics'
import { deriveFcaStatus, isFcaOverdue, listFcas } from '../lib/fca'
import { clearFcaReturnContext } from '../lib/navigationContext'
import type { DashboardFilters } from '../types/dashboard'
import type { FcaWithActions } from '../types/fca'
import type { HubBootstrap } from '../types/hub'

export function FcaListPage({filters}:{hub:HubBootstrap;filters:DashboardFilters}){
  const[rows,setRows]=useState<FcaWithActions[]>([])
  const[loading,setLoading]=useState(true)
  const[error,setError]=useState<string|null>(null)
  const[search,setSearch]=useState('')
  const[status,setStatus]=useState('')

  useEffect(()=>{
    clearFcaReturnContext()
    setLoading(true)
    setError(null)
    void listFcas().then(setRows).catch(err=>setError(err instanceof Error?err.message:'Erro ao carregar FCA.')).finally(()=>setLoading(false))
  },[])

  const scopedRows=useMemo(()=>rows.filter(row=>{
    if(filters.fcaPeriodo!=='ALL'&&row.data_reuniao.slice(0,7)!==filters.fcaPeriodo)return false
    if(filters.supervisorId&&row.supervisor_id!==filters.supervisorId&&row.substituto_id!==filters.supervisorId)return false
    if(filters.moduloId&&row.modulo_id!==filters.moduloId)return false
    if(search.trim()){
      const q=search.trim().toLocaleLowerCase('pt-BR')
      const hay=`${row.numero} ${row.depositante_nome} ${row.indicador_nome} ${row.supervisor_nome} ${row.causa}`.toLocaleLowerCase('pt-BR')
      if(!hay.includes(q))return false
    }
    return true
  }),[rows,filters.fcaPeriodo,filters.supervisorId,filters.moduloId,search])

  const counts=useMemo(()=>scopedRows.reduce((acc,row)=>{
    const key=isFcaOverdue(row)?'VENCIDO':deriveFcaStatus(row)
    acc[key]=(acc[key]??0)+1
    return acc
  },{} as Record<string,number>),[scopedRows])

  const filtered=useMemo(()=>scopedRows.filter(row=>{
    const derived=deriveFcaStatus(row),overdue=isFcaOverdue(row)
    if(status==='VENCIDO')return overdue
    if(status)return derived===status
    return true
  }),[scopedRows,status])

  const summary:SummaryMetricItem[]=[
    {key:'all',label:'Todos',value:scopedRows.length,detail:'registros no escopo',icon:'dataset',tone:'neutral',active:status==='',onClick:()=>setStatus('')},
    {key:'open',label:'Abertos',value:counts.ABERTO??0,detail:'aguardando atuação',icon:'radio_button_unchecked',tone:'info',active:status==='ABERTO',onClick:()=>setStatus('ABERTO')},
    {key:'progress',label:'Em andamento',value:counts.EM_ANDAMENTO??0,detail:'com plano ativo',icon:'autorenew',tone:'warning',active:status==='EM_ANDAMENTO',onClick:()=>setStatus('EM_ANDAMENTO')},
    {key:'overdue',label:'Vencidos',value:counts.VENCIDO??0,detail:'prioridade de atuação',icon:'error',tone:'danger',active:status==='VENCIDO',onClick:()=>setStatus('VENCIDO')},
    {key:'done',label:'Concluídos',value:counts.CONCLUIDO??0,detail:'encerrados no escopo',icon:'check_circle',tone:'success',active:status==='CONCLUIDO',onClick:()=>setStatus('CONCLUIDO')},
  ]

  return <section className="fca-page">
    <PageHeader eyebrow="CONTROLE DE DESVIOS" title="Fatos, causas e ações" description="Acompanhe registros, priorize vencimentos e abra cada FCA para consultar causa, plano de ação e rastreabilidade." actions={<Link className="button button-primary" to="/fca/novo"><span className="material-symbols-rounded">add</span>Novo FCA</Link>}/>

    <SummaryMetrics items={summary} ariaLabel="Filtrar FCA por status" variant="filters"/>

    <Panel className="fca-workspace-card">
      <PanelHeader eyebrow="REGISTROS" title="FCA no escopo atual" description={`${filtered.length} registro(s) após filtros · vencidos permanecem priorizados visualmente pelo status.`} trailing={<Chip>{filters.fcaPeriodo==='ALL'?'Todos os meses':filters.fcaPeriodo}</Chip>}/>
      <PageToolbar
        embedded
        ariaLabel="Filtros da FCA"
        search={<SearchField ariaLabel="Pesquisar FCA" placeholder="Pesquisar FCA, depositante, causa…" value={search} onChange={setSearch}/>}
        filters={<select aria-label="Status da FCA" value={status} onChange={event=>setStatus(event.target.value)}><option value="">Todos os status</option><option value="ABERTO">Aberto</option><option value="EM_ANDAMENTO">Em andamento</option><option value="CONCLUIDO">Concluído</option><option value="VENCIDO">Vencido</option><option value="CANCELADO">Cancelado</option></select>}
      />

      <div className="fca-results">
        {loading&&<Skeleton lines={7}/>} 
        {!loading&&error&&<EmptyState tone="error" icon="error" title="Não foi possível carregar os FCAs" description={error}/>} 
        {!loading&&!error&&(filtered.length===0?<EmptyState title="Nenhum FCA encontrado" description="Ajuste os filtros ou a busca para consultar outros registros."/>:<div className="table-wrap embedded fca-table-wrap"><table className="fca-table responsive-data-table"><thead><tr><th scope="col">Registro</th><th scope="col">Depositante / KPI</th><th scope="col">Responsável</th><th scope="col">Módulo</th><th scope="col">Status</th><th scope="col"><span className="sr-only">Ação</span></th></tr></thead><tbody>{filtered.map(row=>{const derived=deriveFcaStatus(row),overdue=isFcaOverdue(row),display=overdue?'VENCIDO':derived;return <tr key={row.id}><td data-label="FCA" data-primary="true"><div className="fca-record-cell"><Link className="fca-number-link" to={`/fca/${row.id}`}>#{String(row.numero).padStart(5,'0')}</Link><small>{new Date(`${row.data_reuniao}T12:00:00`).toLocaleDateString('pt-BR')}</small></div></td><td data-label="Depositante"><div className="fca-entity-cell"><strong>{row.depositante_nome}</strong><span>{row.indicador_nome}</span></div></td><td data-label="Responsável"><div className="fca-owner-cell"><strong>{row.supervisor_nome}</strong><span>Supervisor</span></div></td><td data-label="Módulo"><span className="module-badge">{row.modulo_id}</span></td><td data-label="Status"><StatusBadge status={display}/></td><td className="fca-open-cell"><Link className="fca-open-link" to={`/fca/${row.id}`}>Abrir<span className="material-symbols-rounded" aria-hidden="true">chevron_right</span></Link></td></tr>})}</tbody></table></div>)}
      </div>
    </Panel>
  </section>
}
