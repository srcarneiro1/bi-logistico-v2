import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from 'primereact/button'
import { Column } from 'primereact/column'
import { DataTable } from 'primereact/datatable'
import { FcaCompactList } from '../components/FcaCompactList'
import { PageHeader } from '../components/PageHeader'
import { SimpleLineChart } from '../components/SimpleLineChart'
import { MetricStatusBadge } from '../components/ui/Badge'
import { Chip } from '../components/ui/Chip'
import { DetailHero, DetailMetrics } from '../components/ui/DetailHero'
import { EmptyState, Skeleton } from '../components/ui/Feedback'
import { PageToolbar } from '../components/ui/PageToolbar'
import { Panel, PanelHeader } from '../components/ui/Panel'
import { SearchField } from '../components/ui/SearchField'
import { SectionHeader } from '../components/ui/SectionHeader'
import { SummaryMetrics } from '../components/ui/SummaryMetrics'
import { deriveFcaDisplayStatus, listFcas } from '../lib/fca'
import { indicatorMeta, metricStatus, money, pct, periodKey } from '../lib/dashboard'
import { clearDepositorReturnContext, consumeDepositorTarget, getDepositorReturnContext, prepareDepositorReturnTarget, setFcaReturnContext } from '../lib/navigationContext'
import type { DashboardFilters, MetricStatus } from '../types/dashboard'
import type { FcaWithActions } from '../types/fca'
import type { HubBootstrap } from '../types/hub'

const rank:Record<MetricStatus,number>={crit:3,warn:2,neutral:1,ok:0}
const statusLabel:Record<MetricStatus,string>={crit:'Crítico',warn:'Atenção',neutral:'Sem dados',ok:'Dentro da meta'}
const DEPOSITOR_DETAIL_ID='depositor-360-detail'
const INVALID_CNPJ='00000000000000'
const normalizeDepositorName=(value:string)=>value.toLocaleUpperCase('pt-BR').normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim()
const isFinancialOnlyRevenue=(name:string)=>normalizeDepositorName(name)==='OUTRAS RECEITAS OPERACIONAIS'

export function DepositantesPage({hub,filters}:{hub:HubBootstrap;filters:DashboardFilters}){
 const navigate=useNavigate()
 const initialNavigation=useMemo(()=>{
   const cnpj=consumeDepositorTarget()
   const context=cnpj?getDepositorReturnContext():null
   if(!cnpj)clearDepositorReturnContext()
   return{cnpj,context}
 },[])
 const incoming=initialNavigation.cnpj
 const returnContext=initialNavigation.context
 const[search,setSearch]=useState(''),[selectedCnpj,setSelectedCnpj]=useState(incoming),[fcas,setFcas]=useState<FcaWithActions[]>([]),[fcaLoading,setFcaLoading]=useState(false)
 useEffect(()=>{setFcaLoading(true);void listFcas().then(setFcas).catch(()=>setFcas([])).finally(()=>setFcaLoading(false))},[])
 const selectedPeriodKey=periodKey(filters.periodo)
 const metaProd=indicatorMeta(hub,'Lead Time Produção'),metaRec=indicatorMeta(hub,'Lead Time Recebimento'),metaInv=indicatorMeta(hub,'Inventário')
 const baseRows=useMemo(()=>hub.depositantes.filter(d=>!isFinancialOnlyRevenue(d.nome)&&(!filters.supervisorId||d.supervisorId===filters.supervisorId)&&(!filters.moduloId||d.moduloId===filters.moduloId)&&(!search||`${d.nome} ${d.cnpj} ${d.codAllStrategy??''}`.toLocaleLowerCase('pt-BR').includes(search.toLocaleLowerCase('pt-BR')))),[hub.depositantes,filters.supervisorId,filters.moduloId,search])
 const rows=useMemo(()=>baseRows.map(d=>{
   const op=hub.facts.kpiOperacional.find(r=>r.cnpj===d.cnpj&&(!selectedPeriodKey||periodKey(r.periodo)===selectedPeriodKey))
   const inv=hub.facts.kpiInventarioDepositante.find(r=>r.cnpj===d.cnpj&&(!selectedPeriodKey||periodKey(r.periodo)===selectedPeriodKey))
   const statuses=[metricStatus(op?.producaoPct,metaProd),metricStatus(op?.recebimentoPct,metaRec),metricStatus(inv?.totalPct,metaInv)]
   const status=statuses.reduce((a,b)=>rank[b]>rank[a]?b:a,'ok' as MetricStatus)
   const sup=hub.supervisors.find(s=>s.supervisorId===d.supervisorId)
   return{d,op,inv,status,sup,rowId:d.cnpj}
 }).sort((a,b)=>rank[b.status]-rank[a.status]||a.d.nome.localeCompare(b.d.nome,'pt-BR')),[baseRows,hub.facts.kpiOperacional,hub.facts.kpiInventarioDepositante,hub.supervisors,metaProd,metaRec,metaInv,selectedPeriodKey])
 type DepositorRow=(typeof rows)[number]
 useEffect(()=>{if(selectedCnpj&&!rows.some(r=>r.d.cnpj===selectedCnpj))setSelectedCnpj('')},[filters.supervisorId,filters.moduloId,rows,selectedCnpj])
 const selected=hub.depositantes.find(d=>d.cnpj===selectedCnpj&&!isFinancialOnlyRevenue(d.nome))??null
 const supervisor=selected?hub.supervisors.find(s=>s.supervisorId===selected.supervisorId):null
 const opCurrent=selected?hub.facts.kpiOperacional.find(r=>r.cnpj===selected.cnpj&&(!selectedPeriodKey||periodKey(r.periodo)===selectedPeriodKey)):undefined
 const invCurrent=selected?hub.facts.kpiInventarioDepositante.find(r=>r.cnpj===selected.cnpj&&(!selectedPeriodKey||periodKey(r.periodo)===selectedPeriodKey)):undefined
 const currentStatuses=[metricStatus(opCurrent?.producaoPct,metaProd),metricStatus(opCurrent?.recebimentoPct,metaRec),metricStatus(invCurrent?.totalPct,metaInv)]
 const selectedStatus=currentStatuses.reduce((a,b)=>rank[b]>rank[a]?b:a,'ok' as MetricStatus)
 const history=selected?hub.facts.kpiOperacional.filter(r=>r.cnpj===selected.cnpj&&(!selectedPeriodKey||periodKey(r.periodo)<=selectedPeriodKey)).sort((a,b)=>periodKey(a.periodo).localeCompare(periodKey(b.periodo))).slice(-18):[]
 const invHistory=selected?hub.facts.kpiInventarioDepositante.filter(r=>r.cnpj===selected.cnpj&&(!selectedPeriodKey||periodKey(r.periodo)<=selectedPeriodKey)).sort((a,b)=>periodKey(a.periodo).localeCompare(periodKey(b.periodo))).slice(-18):[]
 const invMap=new Map(invHistory.map(r=>[periodKey(r.periodo),r.totalPct]))
 const periodKeys=Array.from(new Set([...history.map(r=>periodKey(r.periodo)),...invHistory.map(r=>periodKey(r.periodo))])).sort()
 const labelByKey=new Map([...history,...invHistory].map(r=>[periodKey(r.periodo),r.periodo]))
 const historySeries=[{label:'Produção',tone:'red' as const,values:history.map(r=>({periodo:r.periodo,value:r.producaoPct}))},{label:'Recebimento',tone:'gray' as const,values:history.map(r=>({periodo:r.periodo,value:r.recebimentoPct}))},{label:'Inventário',tone:'blue' as const,values:periodKeys.map(key=>({periodo:labelByKey.get(key)??key,value:invMap.get(key)??null}))}]
 const finance=selected?hub.facts.receita.find(r=>(!selectedPeriodKey||periodKey(r.periodo)===selectedPeriodKey)&&((selected.codAllStrategy&&r.codAllStrategy===selected.codAllStrategy)||(selected.cnpj!==INVALID_CNPJ&&r.cnpj===selected.cnpj))):undefined
 const attainment=finance?.receitaPlanejada?((finance.receitaRealizada??0)/finance.receitaPlanejada):null
 const relatedFcas=selected?fcas.filter(f=>f.depositante_cnpj===selected.cnpj&&(!selectedPeriodKey||f.data_reuniao.slice(0,7)===selectedPeriodKey)).sort((a,b)=>Number(deriveFcaDisplayStatus(b)==='VENCIDO')-Number(deriveFcaDisplayStatus(a)==='VENCIDO')||b.data_reuniao.localeCompare(a.data_reuniao)||b.numero-a.numero):[]
 const criticalCount=rows.filter(r=>r.status==='crit').length,warningCount=rows.filter(r=>r.status==='warn').length,stableCount=rows.filter(r=>r.status==='ok').length
 const returnLabel=returnContext?.type==='supervisor'?'Voltar para Supervisores':returnContext?.type==='home'?'Voltar para Visão geral':''
 function returnToOrigin(){navigate(prepareDepositorReturnTarget(returnContext))}
 const nameBody=(row:DepositorRow)=>{
   const isSelected=selectedCnpj===row.d.cnpj
   return <Button text className="nx-table-link depositor-open-button" aria-label={`Abrir visão de ${row.d.nome}`} aria-expanded={isSelected} aria-controls={DEPOSITOR_DETAIL_ID} onClick={event=>{event.stopPropagation();setSelectedCnpj(row.d.cnpj)}}><span className="table-primary"><strong>{row.d.nome}</strong><span>{row.d.codAllStrategy??'Sem código AllStrategy'}</span></span></Button>
 }
 const supervisorBody=(row:DepositorRow)=><span>{row.sup?.nomeExibicao??row.d.supervisorId}</span>
 const moduleBody=(row:DepositorRow)=><Chip>{row.d.moduloId}</Chip>
 const prodBody=(row:DepositorRow)=><span className={`metric-cell metric-cell-${metricStatus(row.op?.producaoPct,metaProd)}`}>{pct(row.op?.producaoPct)}</span>
 const recBody=(row:DepositorRow)=><span className={`metric-cell metric-cell-${metricStatus(row.op?.recebimentoPct,metaRec)}`}>{pct(row.op?.recebimentoPct)}</span>
 const invBody=(row:DepositorRow)=><span className={`metric-cell metric-cell-${metricStatus(row.inv?.totalPct,metaInv)}`}>{pct(row.inv?.totalPct)}</span>
 const statusBody=(row:DepositorRow)=><MetricStatusBadge status={row.status} label={statusLabel[row.status]}/>
 const cnpjBody=(row:DepositorRow)=><span className="mono">{row.d.cnpj}</span>
 return <section className="depositors-discovery">
 <PageHeader eyebrow="CARTEIRA" title="Depositantes" description="Selecione um cliente para abrir a visão 360º do período, com operação, resultado e FCAs relacionados."/>
 <PageToolbar ariaLabel="Ferramentas de depositantes" search={<SearchField ariaLabel="Buscar depositante" value={search} onChange={setSearch} placeholder="Buscar por nome, CNPJ ou código…"/>}/>
 {selected&&<article id={DEPOSITOR_DETAIL_ID} className="depositor-360">
   <DetailHero
     eyebrow="Depositante selecionado"
     title={selected.nome}
     description={`${selected.codAllStrategy??'Sem código AllStrategy'} · CNPJ ${selected.cnpj}`}
     status={<MetricStatusBadge status={selectedStatus} label={statusLabel[selectedStatus]}/>} 
     meta={[
       {label:'Supervisor',value:supervisor?.nomeExibicao??selected.supervisorId},
       {label:'Módulo',value:selected.moduloId},
       {label:'FCAs no período',value:relatedFcas.length},
       {label:'Atingimento financeiro',value:attainment==null?'Sem planejamento':pct(attainment)},
     ]}
     actions={<>{returnContext&&<Button label={returnLabel} icon="pi pi-arrow-left" outlined severity="secondary" onClick={returnToOrigin}/>}<Button label="Fechar visão" icon="pi pi-times" outlined severity="secondary" onClick={()=>setSelectedCnpj('')}/></>} 
   />
   <DetailMetrics items={[
     {key:'prod',label:'Produção',value:pct(opCurrent?.producaoPct),detail:`Meta ${pct(metaProd?.metaPct)}`,tone:metricStatus(opCurrent?.producaoPct,metaProd)==='crit'?'danger':metricStatus(opCurrent?.producaoPct,metaProd)==='warn'?'warning':metricStatus(opCurrent?.producaoPct,metaProd)==='ok'?'success':'neutral'},
     {key:'rec',label:'Recebimento',value:pct(opCurrent?.recebimentoPct),detail:`Meta ${pct(metaRec?.metaPct)}`,tone:metricStatus(opCurrent?.recebimentoPct,metaRec)==='crit'?'danger':metricStatus(opCurrent?.recebimentoPct,metaRec)==='warn'?'warning':metricStatus(opCurrent?.recebimentoPct,metaRec)==='ok'?'success':'neutral'},
     {key:'inv',label:'Inventário',value:pct(invCurrent?.totalPct),detail:`Meta ${pct(metaInv?.metaPct)}`,tone:metricStatus(invCurrent?.totalPct,metaInv)==='crit'?'danger':metricStatus(invCurrent?.totalPct,metaInv)==='warn'?'warning':metricStatus(invCurrent?.totalPct,metaInv)==='ok'?'success':'neutral'},
     {key:'rev',label:'Receita realizada',value:money(finance?.receitaRealizada),detail:attainment==null?'Sem planejamento':`${pct(attainment)} do planejado`,tone:attainment==null?'neutral':attainment>=1?'success':attainment<.95?'danger':'warning'},
   ]}/>
   <div className="depositor-grid"><Panel as="article"><PanelHeader eyebrow="HISTÓRICO ATÉ O PERÍODO" title="Evolução operacional"/><div className="panel-body"><SimpleLineChart series={historySeries}/></div></Panel><Panel as="article"><PanelHeader eyebrow="FINANCEIRO" title="Resultado do período"/><div className="finance-summary"><div><span>Planejado</span><strong>{money(finance?.receitaPlanejada)}</strong></div><div><span>Realizado</span><strong>{money(finance?.receitaRealizada)}</strong></div><div><span>Atingimento</span><strong className={attainment!=null&&attainment>=1?'text-ok':attainment!=null&&attainment<.95?'text-crit':''}>{pct(attainment)}</strong></div></div></Panel></div>
   <Panel as="article" className="depositor-fcas"><PanelHeader eyebrow="FCA DO PERÍODO" title="Fatos, causas e ações do cliente" trailing={<Chip>{relatedFcas.length} registro(s)</Chip>}/>{fcaLoading?<Skeleton lines={4}/>:relatedFcas.length?<FcaCompactList items={relatedFcas.slice(0,8)} title={f=>`FCA #${String(f.numero).padStart(5,'0')}`} meta={f=>`${new Date(`${f.data_reuniao}T12:00:00`).toLocaleDateString('pt-BR')} · ${f.indicador_nome}`} onOpen={()=>setFcaReturnContext({type:'depositante',cnpj:selected.cnpj})}/>:<EmptyState icon="check_circle" title="Nenhum FCA no período" description="Este depositante não possui FCA no período selecionado."/>}</Panel>
 </article>}
 <SummaryMetrics ariaLabel="Resumo dos depositantes no escopo" items={[
   {key:'depositors',label:'Depositantes',value:rows.length,detail:'visíveis no filtro',icon:'inventory_2'},
   {key:'critical',label:'Críticos',value:criticalCount,detail:'prioridade de atuação',tone:criticalCount?'danger':'neutral',icon:'error'},
   {key:'warning',label:'Em atenção',value:warningCount,detail:'sem criticidade',tone:warningCount?'warning':'neutral',icon:'warning'},
   {key:'stable',label:'Estáveis',value:stableCount,detail:'dentro da meta',tone:'success',icon:'check_circle'},
 ]}/>
 <SectionHeader eyebrow="CARTEIRA" title="Performance por depositante" description="Ordenação prioriza clientes críticos e, em seguida, os casos em atenção." trailing={<Chip>{rows.length} resultado(s)</Chip>}/>
 <div className="depositors-prime-table" aria-label="Performance por depositante">
   <DataTable value={rows} dataKey="rowId" size="small" rowHover responsiveLayout="scroll" className="nx-prime-table" rowClassName={(row:DepositorRow)=>row.d.cnpj===selectedCnpj?'depositor-row-selected':''} onRowClick={event=>setSelectedCnpj((event.data as DepositorRow).d.cnpj)} emptyMessage="Nenhum depositante encontrado no escopo." tableStyle={{minWidth:'1020px'}}>
     <Column header="Depositante" body={nameBody}/>
     <Column header="Supervisor" body={supervisorBody}/>
     <Column header="Módulo" body={moduleBody}/>
     <Column header="Produção" body={prodBody}/>
     <Column header="Recebimento" body={recBody}/>
     <Column header="Inventário" body={invBody}/>
     <Column header="Status" body={statusBody}/>
     <Column header="CNPJ" body={cnpjBody}/>
   </DataTable>
 </div>
 <div className="depositors-mobile-records" role="list" aria-label="Performance por depositante">
   {rows.map(row=>{const isSelected=selectedCnpj===row.d.cnpj;return <article key={row.rowId} className={`depositor-mobile-record ${isSelected?'is-selected':''}`} role="listitem" onClick={()=>setSelectedCnpj(row.d.cnpj)}>
     <header><div><Button text className="nx-table-link depositor-open-button" aria-expanded={isSelected} aria-controls={DEPOSITOR_DETAIL_ID} onClick={event=>{event.stopPropagation();setSelectedCnpj(row.d.cnpj)}}><span className="table-primary"><strong>{row.d.nome}</strong><span>{row.d.codAllStrategy??'Sem código AllStrategy'}</span></span></Button><div className="depositor-mobile-context"><Chip>{row.d.moduloId}</Chip><span>{row.sup?.nomeExibicao??row.d.supervisorId}</span></div></div>{statusBody(row)}</header>
     <div className="depositor-mobile-metrics"><div><span>Produção</span>{prodBody(row)}</div><div><span>Recebimento</span>{recBody(row)}</div><div><span>Inventário</span>{invBody(row)}</div></div>
     <footer><span>CNPJ</span><span className="mono">{row.d.cnpj}</span></footer>
   </article>})}
   {!rows.length&&<EmptyState icon="search" title="Nenhum depositante encontrado" description="Ajuste a busca ou os filtros para consultar outro recorte."/>}
 </div>
 </section>
}
