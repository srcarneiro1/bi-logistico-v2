import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from 'primereact/button'
import { Column } from 'primereact/column'
import { DataTable } from 'primereact/datatable'
import { Dropdown } from 'primereact/dropdown'
import { PageHeader } from '../components/PageHeader'
import { StatusBadge } from '../components/ui/Badge'
import { Chip } from '../components/ui/Chip'
import { EmptyState, Skeleton } from '../components/ui/Feedback'
import { PageToolbar } from '../components/ui/PageToolbar'
import { Panel, PanelHeader } from '../components/ui/Panel'
import { SearchField } from '../components/ui/SearchField'
import { SummaryMetrics, type SummaryMetricItem } from '../components/ui/SummaryMetrics'
import { deriveFcaDisplayStatus, listFcas } from '../lib/fca'
import { clearFcaReturnContext } from '../lib/navigationContext'
import type { DashboardFilters } from '../types/dashboard'
import type { FcaWithActions } from '../types/fca'
import type { HubBootstrap } from '../types/hub'
import '../fca-card-selection.css'

const statusOptions=[
  {label:'Todos os status',value:''},
  {label:'Aberto',value:'ABERTO'},
  {label:'Em andamento',value:'EM_ANDAMENTO'},
  {label:'Concluído',value:'CONCLUIDO'},
  {label:'Vencido',value:'VENCIDO'},
  {label:'Cancelado',value:'CANCELADO'},
]

export function FcaListPage({filters}:{hub:HubBootstrap;filters:DashboardFilters}){
  const navigate=useNavigate()
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
    const key=deriveFcaDisplayStatus(row)
    acc[key]=(acc[key]??0)+1
    return acc
  },{} as Record<string,number>),[scopedRows])

  const filtered=useMemo(()=>scopedRows.filter(row=>!status||deriveFcaDisplayStatus(row)===status),[scopedRows,status])

  const summary:SummaryMetricItem[]=[
    {key:'all',label:'Todos',value:scopedRows.length,detail:'registros no escopo',icon:'dataset',tone:'neutral',active:status==='',onClick:()=>setStatus('')},
    {key:'open',label:'Abertos',value:counts.ABERTO??0,detail:'aguardando atuação',icon:'radio_button_unchecked',tone:'info',active:status==='ABERTO',onClick:()=>setStatus('ABERTO')},
    {key:'progress',label:'Em andamento',value:counts.EM_ANDAMENTO??0,detail:'com plano ativo',icon:'autorenew',tone:'warning',active:status==='EM_ANDAMENTO',onClick:()=>setStatus('EM_ANDAMENTO')},
    {key:'overdue',label:'Vencidos',value:counts.VENCIDO??0,detail:'prioridade de atuação',icon:'error',tone:'danger',active:status==='VENCIDO',onClick:()=>setStatus('VENCIDO')},
    {key:'done',label:'Concluídos',value:counts.CONCLUIDO??0,detail:'encerrados no escopo',icon:'check_circle',tone:'success',active:status==='CONCLUIDO',onClick:()=>setStatus('CONCLUIDO')},
  ]
  const recordBody=(row:FcaWithActions)=><div className="fca-record-cell"><Link className="fca-number-link" to={`/fca/${row.id}`}>#{String(row.numero).padStart(5,'0')}</Link><small>{new Date(`${row.data_reuniao}T12:00:00`).toLocaleDateString('pt-BR')}</small></div>
  const entityBody=(row:FcaWithActions)=><div className="fca-entity-cell"><strong>{row.depositante_nome}</strong><span>{row.indicador_nome}</span></div>
  const ownerBody=(row:FcaWithActions)=><div className="fca-owner-cell"><strong>{row.supervisor_nome}</strong><span>Supervisor</span></div>
  const moduleBody=(row:FcaWithActions)=><Chip>{row.modulo_id}</Chip>
  const statusBody=(row:FcaWithActions)=><StatusBadge status={deriveFcaDisplayStatus(row)}/>
  const actionBody=(row:FcaWithActions)=><Button label="Abrir" icon="pi pi-chevron-right" iconPos="right" text className="fca-open-prime" onClick={()=>navigate(`/fca/${row.id}`)}/>

  return <section className="fca-page">
    <PageHeader eyebrow="CONTROLE DE DESVIOS" title="Fatos, causas e ações" description="Acompanhe registros, priorize vencimentos e abra cada FCA para consultar causa, plano de ação e rastreabilidade." actions={<Button label="Novo FCA" icon="pi pi-plus" onClick={()=>navigate('/fca/novo')}/>}/>

    <SummaryMetrics items={summary} ariaLabel="Filtrar FCA por status" variant="filters"/>

    <Panel className="fca-workspace-card">
      <PanelHeader eyebrow="REGISTROS" title="FCA no escopo atual" description={`${filtered.length} registro(s) após filtros · vencidos permanecem priorizados visualmente pelo status.`} trailing={<Chip>{filters.fcaPeriodo==='ALL'?'Todos os meses':filters.fcaPeriodo}</Chip>}/>
      <PageToolbar
        embedded
        ariaLabel="Filtros da FCA"
        search={<SearchField ariaLabel="Pesquisar FCA" placeholder="Pesquisar FCA, depositante, causa…" value={search} onChange={setSearch}/>}
        filters={<Dropdown aria-label="Status da FCA" value={status} options={statusOptions} optionLabel="label" optionValue="value" onChange={event=>setStatus(event.value)} className="fca-status-dropdown"/>}
      />

      <div className="fca-results">
        {loading&&<Skeleton lines={7}/>} 
        {!loading&&error&&<EmptyState tone="error" icon="error" title="Não foi possível carregar os FCAs" description={error}/>} 
        {!loading&&!error&&(filtered.length===0?<EmptyState title="Nenhum FCA encontrado" description="Ajuste os filtros ou a busca para consultar outros registros."/>:<>
          <div className="fca-prime-table" aria-label="FCA no escopo atual">
            <DataTable value={filtered} dataKey="id" size="small" rowHover responsiveLayout="scroll" className="nx-prime-table" tableStyle={{minWidth:'880px'}}>
              <Column header="Registro" body={recordBody}/>
              <Column header="Depositante / KPI" body={entityBody}/>
              <Column header="Responsável" body={ownerBody}/>
              <Column header="Módulo" body={moduleBody}/>
              <Column header="Status" body={statusBody}/>
              <Column header="Ação" body={actionBody}/>
            </DataTable>
          </div>
          <div className="fca-mobile-records" role="list" aria-label="FCA no escopo atual">
            {filtered.map(row=><article key={row.id} className="fca-mobile-record" role="listitem">
              <header><div>{recordBody(row)}</div>{statusBody(row)}</header>
              <div className="fca-mobile-entity"><strong>{row.depositante_nome}</strong><span>{row.indicador_nome}</span></div>
              <div className="fca-mobile-meta"><div><span>Responsável</span><strong>{row.supervisor_nome}</strong></div><div><span>Módulo</span><Chip>{row.modulo_id}</Chip></div></div>
              <Button label="Abrir FCA" icon="pi pi-chevron-right" iconPos="right" outlined severity="secondary" onClick={()=>navigate(`/fca/${row.id}`)}/>
            </article>)}
          </div>
        </>)}
      </div>
    </Panel>
  </section>
}
