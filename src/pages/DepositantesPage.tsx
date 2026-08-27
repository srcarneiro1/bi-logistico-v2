import { useEffect, useMemo, useState } from 'react'
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
import { setFcaReturnContext } from '../lib/navigationContext'
import type { DashboardFilters, MetricStatus } from '../types/dashboard'
import type { FcaWithActions } from '../types/fca'
import type { HubBootstrap } from '../types/hub'

const rank:Record<MetricStatus,number>={crit:3,warn:2,neutral:1,ok:0}
const statusLabel:Record<MetricStatus,string>={crit:'Crítico',warn:'Atenção',neutral:'Sem dados',ok:'Dentro da meta'}

export function DepositantesPage({hub,filters}:{hub:HubBootstrap;filters:DashboardFilters}){
 const incoming=useMemo(()=>{const cnpj=sessionStorage.getItem('bi-logistico-v2:depositante')||'';if(cnpj)sessionStorage.removeItem('bi-logistico-v2:depositante');return cnpj},[])
 const[search,setSearch]=useState(''),[selectedCnpj,setSelectedCnpj]=useState(incoming),[fcas,setFcas]=useState<FcaWithActions[]>([]),[fcaLoading,setFcaLoading]=useState(false)
 useEffect(()=>{setFcaLoading(true);void listFcas().then(setFcas).catch(()=>setFcas([])).finally(()=>setFcaLoading(false))},[])
 const selectedPeriodKey=periodKey(filters.periodo)
 const metaProd=indicatorMeta(hub,'Lead Time Produção'),metaRec=indicatorMeta(hub,'Lead Time Recebimento'),metaInv=indicatorMeta(hub,'Inventário')
 const baseRows=useMemo(()=>hub.depositantes.filter(d=>(!filters.supervisorId||d.supervisorId===filters.supervisorId)&&(!filters.moduloId||d.moduloId===filters.moduloId)&&(!search||`${d.nome} ${d.cnpj} ${d.codAllStrategy??''}`.toLocaleLowerCase('pt-BR').includes(search.toLocaleLowerCase('pt-BR')))),[hub.depositantes,filters.supervisorId,filters.moduloId,search])
 const rows=useMemo(()=>baseRows.map(d=>{
   const op=hub.facts.kpiOperacional.find(r=>r.cnpj===d.cnpj&&(!selectedPeriodKey||periodKey(r.periodo)===selectedPeriodKey))
   const inv=hub.facts.kpiInventarioDepositante.find(r=>r.cnpj===d.cnpj&&(!selectedPeriodKey||periodKey(r.periodo)===selectedPeriodKey))
   const statuses=[metricStatus(op?.producaoPct,metaProd),metricStatus(op?.recebimentoPct,metaRec),metricStatus(inv?.totalPct,metaInv)]
   const status=statuses.reduce((a,b)=>rank[b]>rank[a]?b:a,'ok' as MetricStatus)
   const sup=hub.supervisors.find(s=>s.supervisorId===d.supervisorId)
   return{d,op,inv,status,sup}
 }).sort((a,b)=>rank[b.status]-rank[a.status]||a.d.nome.localeCompare(b.d.nome,'pt-BR')),[baseRows,hub.facts.kpiOperacional,hub.facts.kpiInventarioDepositante,hub.supervisors,metaProd,metaRec,metaInv,selectedPeriodKey])
 useEffect(()=>{if(selectedCnpj&&!rows.some(r=>r.d.cnpj===selectedCnpj))setSelectedCnpj('')},[filters.supervisorId,filters.moduloId,rows,selectedCnpj])
 const selected=hub.depositantes.find(d=>d.cnpj===selectedCnpj)??null
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
 const finance=selected?hub.facts.receita.find(r=>r.cnpj===selected.cnpj&&(!selectedPeriodKey||periodKey(r.periodo)===selectedPeriodKey)):undefined
 const attainment=finance?.receitaPlanejada?((finance.receitaRealizada??0)/finance.receitaPlanejada):null
 const relatedFcas=selected?fcas.filter(f=>f.depositante_cnpj===selected.cnpj&&(!selectedPeriodKey||f.data_reuniao.slice(0,7)===selectedPeriodKey)).sort((a,b)=>Number(deriveFcaDisplayStatus(b)==='VENCIDO')-Number(deriveFcaDisplayStatus(a)==='VENCIDO')||b.data_reuniao.localeCompare(a.data_reuniao)||b.numero-a.numero):[]
 const criticalCount=rows.filter(r=>r.status==='crit').length,warningCount=rows.filter(r=>r.status==='warn').length,stableCount=rows.filter(r=>r.status==='ok').length
 return <section className="depositors-discovery">
 <PageHeader eyebrow="CARTEIRA" title="Depositantes" description="Selecione um cliente para abrir a visão 360º do período, com operação, resultado e FCAs relacionados."/>
 <PageToolbar ariaLabel="Ferramentas de depositantes" search={<SearchField ariaLabel="Buscar depositante" value={search} onChange={setSearch} placeholder="Buscar por nome, CNPJ ou código…"/>}/>
 {selected&&<article className="depositor-360">
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
     actions={<button className="button" onClick={()=>setSelectedCnpj('')}>Fechar visão</button>}
   />
   <DetailMetrics items={[
     {key:'prod',label:'Produção',value:pct(opCurrent?.producaoPct),detail:`Meta ${pct(metaProd?.metaPct)}`,tone:metricStatus(opCurrent?.producaoPct,metaProd)==='crit'?'danger':metricStatus(opCurrent?.producaoPct,metaProd)==='warn'?'warning':metricStatus(opCurrent?.producaoPct,metaProd)==='ok'?'success':'neutral'},
     {key:'rec',label:'Recebimento',value:pct(opCurrent?.recebimentoPct),detail:`Meta ${pct(metaRec?.metaPct)}`,tone:metricStatus(opCurrent?.recebimentoPct,metaRec)==='crit'?'danger':metricStatus(opCurrent?.recebimentoPct,metaRec)==='warn'?'warning':metricStatus(opCurrent?.recebimentoPct,metaRec)==='ok'?'success':'neutral'},
     {key:'inv',label:'Inventário',value:pct(invCurrent?.totalPct),detail:`Meta ${pct(metaInv?.metaPct)}`,tone:metricStatus(invCurrent?.totalPct,metaInv)==='crit'?'danger':metricStatus(invCurrent?.totalPct,metaInv)==='warn'?'warning':metricStatus(invCurrent?.totalPct,metaInv)==='ok'?'success':'neutral'},
     {key:'rev',label:'Receita realizada',value:money(finance?.receitaRealizada),detail:attainment==null?'Sem planejamento':`${pct(attainment)} do planejado`,tone:attainment==null?'neutral':attainment>=1?'success':attainment<.95?'danger':'warning'},
   ]}/>
   <div className="depositor-grid"><Panel as="article"><PanelHeader eyebrow="HISTÓRICO ATÉ O PERÍODO" title="Evolução operacional"/><div className="panel-body"><SimpleLineChart series={historySeries}/></div></Panel><Panel as="article"><PanelHeader eyebrow="FINANCEIRO" title="Resultado do período"/><div className="finance-summary"><div><span>Planejado</span><strong>{money(finance?.receitaPlanejada)}</strong></div><div><span>Realizado</span><strong>{money(finance?.receitaRealizada)}</strong></div><div><span>Atingimento</span><strong className={attainment!=null&&attainment>=1?'text-ok':attainment!=null&&attainment<.95?'text-crit':''}>{pct(attainment)}</strong></div></div></Panel></div>
   <Panel as="article" className="depositor-fcas"><PanelHeader eyebrow="FCA DO PERÍODO" title="Fatos, causas e ações do cliente" trailing={<Chip>{relatedFcas.length} registro(s)</Chip>}/>{fcaLoading?<Skeleton lines={4}/>:relatedFcas.length?<FcaCompactList items={relatedFcas.slice(0,8)} title={f=>`FCA #${String(f.numero).padStart(5,'0')}`} meta={f=>`${new Date(`${f.data_reuniao}T12:00:00`).toLocaleDateString('pt-BR')} · ${f.indicador_nome}`} onOpen={()=>setFcaReturnContext({type:'depositante',cnpj:selected.cnpj})}/>:<EmptyState icon="fact_check" title="Nenhum FCA no período" description="Este depositante não possui FCA no período selecionado."/>}</Panel>
 </article>}
 <SummaryMetrics ariaLabel="Resumo dos depositantes no escopo" items={[
   {key:'depositors',label:'Depositantes',value:rows.length,detail:'visíveis no filtro',icon:'inventory_2'},
   {key:'critical',label:'Críticos',value:criticalCount,detail:'prioridade de atuação',tone:criticalCount?'danger':'neutral',icon:'error'},
   {key:'warning',label:'Em atenção',value:warningCount,detail:'sem criticidade',tone:warningCount?'warning':'neutral',icon:'warning'},
   {key:'stable',label:'Estáveis',value:stableCount,detail:'dentro da meta',tone:'success',icon:'check_circle'},
 ]}/>
 <SectionHeader eyebrow="CARTEIRA" title="Performance por depositante" description="Ordenação prioriza clientes críticos e, em seguida, os casos em atenção." trailing={<Chip>{rows.length} resultado(s)</Chip>}/>
 <div className="table-wrap depositors-table-wrap"><table className="depositor-table responsive-data-table"><thead><tr><th scope="col">Depositante</th><th scope="col">Supervisor</th><th scope="col">Módulo</th><th scope="col">Produção</th><th scope="col">Recebimento</th><th scope="col">Inventário</th><th scope="col">Status</th><th scope="col">CNPJ</th></tr></thead><tbody>{rows.map(({d,op,inv,status,sup})=><tr key={d.cnpj} className={selectedCnpj===d.cnpj?'selected-row':''} onClick={()=>setSelectedCnpj(d.cnpj)}><td data-label="Depositante" data-primary="true"><button type="button" className="table-link depositor-open-button" onClick={event=>{event.stopPropagation();setSelectedCnpj(d.cnpj)}} aria-label={`Abrir visão de ${d.nome}`}><span className="table-primary"><strong>{d.nome}</strong><span>{d.codAllStrategy??'Sem código AllStrategy'}</span></span></button></td><td data-label="Supervisor">{sup?.nomeExibicao??d.supervisorId}</td><td data-label="Módulo"><span className="module-badge">{d.moduloId}</span></td><td data-label="Produção"><span className={`metric-cell metric-cell-${metricStatus(op?.producaoPct,metaProd)}`}>{pct(op?.producaoPct)}</span></td><td data-label="Recebimento"><span className={`metric-cell metric-cell-${metricStatus(op?.recebimentoPct,metaRec)}`}>{pct(op?.recebimentoPct)}</span></td><td data-label="Inventário"><span className={`metric-cell metric-cell-${metricStatus(inv?.totalPct,metaInv)}`}>{pct(inv?.totalPct)}</span></td><td data-label="Status"><MetricStatusBadge status={status} label={statusLabel[status]}/></td><td data-label="CNPJ" className="mono">{d.cnpj}</td></tr>)}{!rows.length&&<tr><td colSpan={8} className="table-empty">Nenhum depositante encontrado no escopo.</td></tr>}</tbody></table></div>
 </section>
}
