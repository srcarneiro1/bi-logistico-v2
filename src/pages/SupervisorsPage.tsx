import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { PageHeader } from '../components/PageHeader'
import { MetricStatusBadge, StatusBadge } from '../components/ui/Badge'
import { DetailHero, DetailMetrics } from '../components/ui/DetailHero'
import { SummaryMetrics } from '../components/ui/SummaryMetrics'
import { avg, indicatorMeta, metricStatus, pct, periodKey, scoped } from '../lib/dashboard'
import { deriveFcaStatus, isFcaOverdue, listFcas } from '../lib/fca'
import { consumeSupervisorReturn, setFcaReturnContext } from '../lib/navigationContext'
import type { FcaWithActions } from '../types/fca'
import type { DashboardFilters, MetricStatus } from '../types/dashboard'
import type { HubBootstrap } from '../types/hub'

const rank:Record<MetricStatus,number>={crit:3,warn:2,neutral:1,ok:0}
const label:Record<MetricStatus,string>={ok:'Dentro da meta',warn:'Atenção',crit:'Crítico',neutral:'Sem dados no período'}
const SUPERVISOR_DETAIL_ID='supervisor-360-detail'
const tone=(status:MetricStatus)=>status==='crit'?'danger':status==='warn'?'warning':status==='ok'?'success':'neutral'

function SupervisorPhoto({name,src,detail=false}:{name:string;src?:string|null;detail?:boolean}){
 const[failed,setFailed]=useState(false)
 useEffect(()=>setFailed(false),[src])
 if(src&&!failed)return <img className={detail?'supervisor-360-avatar-image':'supervisor-card-avatar-image'} src={src} alt="" loading="lazy" decoding="async" onError={()=>setFailed(true)}/>
 return <span className={detail?'supervisor-360-avatar':'supervisor-avatar'} aria-hidden="true">{name.slice(0,2).toUpperCase()}</span>
}

export function SupervisorsPage({hub,filters}:{hub:HubBootstrap;filters:DashboardFilters}){
 const navigate=useNavigate()
 const [selectedSupervisorId,setSelectedSupervisorId]=useState(filters.supervisorId)
 const [fcas,setFcas]=useState<FcaWithActions[]>([])
 useEffect(()=>{const restored=consumeSupervisorReturn();setSelectedSupervisorId(restored||filters.supervisorId)},[filters.supervisorId])
 useEffect(()=>{void listFcas().then(setFcas).catch(()=>setFcas([]))},[])
 const metaProd=indicatorMeta(hub,'Lead Time Produção'),metaRec=indicatorMeta(hub,'Lead Time Recebimento'),metaInv=indicatorMeta(hub,'Inventário')
 const scopedOp=scoped(hub.facts.kpiOperacional,filters),scopedInv=scoped(hub.facts.kpiInventarioDepositante,filters)
 const scopedFcas=useMemo(()=>fcas.filter(f=>{
   if(filters.moduloId&&f.modulo_id!==filters.moduloId)return false
   if(filters.periodo&&f.data_reuniao.slice(0,7)!==periodKey(filters.periodo))return false
   return true
 }),[fcas,filters.moduloId,filters.periodo])
 const cards=hub.supervisors.map(s=>{
   const op=scopedOp.filter(r=>r.supervisorId===s.supervisorId),inv=scopedInv.filter(r=>r.supervisorId===s.supervisorId)
   const deps=hub.depositantes.filter(d=>d.supervisorId===s.supervisorId&&(!filters.moduloId||d.moduloId===filters.moduloId))
   const fcaCount=scopedFcas.filter(f=>f.supervisor_id===s.supervisorId).length
   const prod=avg(op.map(x=>x.producaoPct)),rec=avg(op.map(x=>x.recebimentoPct)),invAvg=avg(inv.map(x=>x.totalPct))
   const statuses=[metricStatus(prod,metaProd),metricStatus(rec,metaRec),metricStatus(invAvg,metaInv)]
   const aggregateStatus=statuses.reduce((a,b)=>rank[b]>rank[a]?b:a,'ok' as MetricStatus)
   const depStatuses=deps.map(d=>{const o=op.find(r=>r.cnpj===d.cnpj),i=inv.find(r=>r.cnpj===d.cnpj);const ss=[metricStatus(o?.producaoPct,metaProd),metricStatus(o?.recebimentoPct,metaRec),metricStatus(i?.totalPct,metaInv)];return ss.reduce((a,b)=>rank[b]>rank[a]?b:a,'ok' as MetricStatus)})
   const critCount=depStatuses.filter(x=>x==='crit').length,warnCount=depStatuses.filter(x=>x==='warn').length
   const status:MetricStatus=critCount>0?'crit':warnCount>0?'warn':aggregateStatus
   return{s,prod,rec,inv:invAvg,deps,status,critCount,warnCount,fcaCount}
 }).sort((a,b)=>b.critCount-a.critCount||b.warnCount-a.warnCount||rank[b.status]-rank[a.status]||a.s.nomeExibicao.localeCompare(b.s.nomeExibicao,'pt-BR'))
 const visibleCards=filters.supervisorId?cards.filter(c=>c.s.supervisorId===filters.supervisorId):cards
 const criticalCards=visibleCards.filter(c=>c.status==='crit').length
 const attentionCards=visibleCards.filter(c=>c.status==='warn').length
 const stableCards=visibleCards.filter(c=>c.status==='ok').length
 const selected=selectedSupervisorId?cards.find(c=>c.s.supervisorId===selectedSupervisorId):null
 const detailRows=selected?.deps.map(d=>{const op=scopedOp.find(r=>r.cnpj===d.cnpj),inv=scopedInv.find(r=>r.cnpj===d.cnpj);const statuses=[metricStatus(op?.producaoPct,metaProd),metricStatus(op?.recebimentoPct,metaRec),metricStatus(inv?.totalPct,metaInv)];const status=statuses.reduce((a,b)=>rank[b]>rank[a]?b:a,'ok' as MetricStatus);return{d,op,inv,status}}).sort((a,b)=>rank[b.status]-rank[a.status]||a.d.nome.localeCompare(b.d.nome,'pt-BR'))??[]
 const selectedFcas=useMemo(()=>selected?[...scopedFcas].filter(f=>{
   if(f.supervisor_id!==selected.s.supervisorId)return false
   const status=deriveFcaStatus(f)
   return status==='ABERTO'||status==='EM_ANDAMENTO'||isFcaOverdue(f)
 }).sort((a,b)=>Number(isFcaOverdue(b))-Number(isFcaOverdue(a))||b.data_reuniao.localeCompare(a.data_reuniao)||b.numero-a.numero):[],[scopedFcas,selected])
 const cardBadge=(critCount:number,warnCount:number,status:MetricStatus)=>critCount?`${critCount} crítico${critCount>1?'s':''}`:warnCount?`${warnCount} em atenção`:label[status]
 function openDepositante(cnpj:string){sessionStorage.setItem('bi-logistico-v2:depositante',cnpj);navigate('/depositantes')}
 return <section className="portfolio-discovery supervisors-discovery">
   <PageHeader eyebrow="LIDERANÇA OPERACIONAL" title="Supervisores" description="Compare carteiras e abra o responsável para analisar depositantes e FCAs pendentes no escopo atual."/>

   {selected&&<article id={SUPERVISOR_DETAIL_ID} className="supervisor-360 supervisor-360-expanded" aria-label={`Visão detalhada de ${selected.s.nomeExibicao}`}>
     <DetailHero
       eyebrow="Supervisor selecionado"
       title={selected.s.nomeExibicao}
       description={`${selected.deps.length} depositante(s) no escopo atual.`}
       leading={<SupervisorPhoto name={selected.s.nomeExibicao} src={selected.s.fotoUrl} detail/>}
       status={<MetricStatusBadge status={selected.status} label={cardBadge(selected.critCount,selected.warnCount,selected.status)}/>} 
       meta={[
         {label:'Depositantes',value:selected.deps.length},
         {label:'FCAs no período',value:selected.fcaCount},
         {label:'FCAs pendentes',value:selectedFcas.length},
         {label:'Módulos',value:Array.from(new Set(selected.deps.map(d=>d.moduloId))).join(', ')||'Sem módulo no escopo'},
       ]}
       actions={<button type="button" className="button" onClick={()=>setSelectedSupervisorId('')}>Fechar visão</button>}
     />

     <DetailMetrics items={[
       {key:'prod',label:'Produção',value:pct(selected.prod),detail:metaProd?.metaPct!=null?`Meta ${pct(metaProd.metaPct)}`:'Média do escopo',tone:tone(metricStatus(selected.prod,metaProd))},
       {key:'rec',label:'Recebimento',value:pct(selected.rec),detail:metaRec?.metaPct!=null?`Meta ${pct(metaRec.metaPct)}`:'Média do escopo',tone:tone(metricStatus(selected.rec,metaRec))},
       {key:'inv',label:'Inventário',value:pct(selected.inv),detail:metaInv?.metaPct!=null?`Meta ${pct(metaInv.metaPct)}`:'Média do escopo',tone:tone(metricStatus(selected.inv,metaInv))},
       {key:'fca',label:'FCAs pendentes',value:selectedFcas.length,detail:`${selected.fcaCount} FCA(s) no período`,tone:selectedFcas.length?'danger':'neutral'},
     ]}/>

     <div className="supervisor-360-grid">
       <section className="dashboard-panel supervisor-portfolio"><div className="panel-head"><div><span className="panel-eyebrow">CARTEIRA</span><h2>Performance por depositante</h2></div><span className="panel-chip">{selected.deps.length} depositante(s)</span></div><div className="table-wrap embedded"><table className="status-table responsive-data-table"><thead><tr><th scope="col">Depositante</th><th scope="col">Módulo</th><th scope="col">Produção</th><th scope="col">Recebimento</th><th scope="col">Inventário</th><th scope="col">Status</th></tr></thead><tbody>{detailRows.map(({d,op,inv,status})=><tr key={d.cnpj}><td data-label="Depositante" data-primary="true"><button type="button" className="table-link" onClick={()=>openDepositante(d.cnpj)}><strong>{d.nome}</strong></button></td><td data-label="Módulo">{d.moduloId}</td><td data-label="Produção"><span className={`metric-cell metric-cell-${metricStatus(op?.producaoPct,metaProd)}`}>{pct(op?.producaoPct)}</span></td><td data-label="Recebimento"><span className={`metric-cell metric-cell-${metricStatus(op?.recebimentoPct,metaRec)}`}>{pct(op?.recebimentoPct)}</span></td><td data-label="Inventário"><span className={`metric-cell metric-cell-${metricStatus(inv?.totalPct,metaInv)}`}>{pct(inv?.totalPct)}</span></td><td data-label="Status"><MetricStatusBadge status={status} label={label[status]}/></td></tr>)}</tbody></table></div></section>
       <section className="dashboard-panel supervisor-open-fcas"><div className="panel-head"><div><span className="panel-eyebrow">PENDÊNCIAS</span><h2>FCAs abertos no período</h2></div><span className={`panel-chip ${selectedFcas.length?'panel-chip-red':''}`}>{selectedFcas.length} pendente(s)</span></div>{selectedFcas.length?<div className="supervisor-fca-list">{selectedFcas.map(f=>{const overdue=isFcaOverdue(f),status=overdue?'VENCIDO':deriveFcaStatus(f);return <Link key={f.id} to={`/fca/${f.id}`} onClick={()=>setFcaReturnContext({type:'supervisor',supervisorId:selected.s.supervisorId})}><div><strong>FCA #{String(f.numero).padStart(5,'0')} · {f.depositante_nome}</strong><span>{f.indicador_nome} · {new Date(`${f.data_reuniao}T12:00:00`).toLocaleDateString('pt-BR')}</span></div><StatusBadge status={status}/></Link>})}</div>:<div className="table-empty">Nenhum FCA pendente para este supervisor no filtro atual.</div>}</section>
     </div>
   </article>}

   <SummaryMetrics ariaLabel="Resumo das carteiras no escopo" items={[
     {key:'supervisors',label:'Supervisores',value:visibleCards.length,detail:'no escopo atual'},
     {key:'critical',label:'Com críticos',value:criticalCards,detail:'prioridade de atuação',tone:criticalCards?'danger':'neutral'},
     {key:'warning',label:'Em atenção',value:attentionCards,detail:'sem crítico na carteira',tone:attentionCards?'warning':'neutral'},
     {key:'stable',label:'Estáveis',value:stableCards,detail:'dentro da meta',tone:'success'},
   ]}/>

   <div className="portfolio-section-heading"><div><span>CARTEIRAS</span><h2>Leitura por supervisor</h2><p>Ordenação prioriza carteiras com depositantes críticos e, em seguida, os casos em atenção.</p></div><span className="panel-chip">{visibleCards.reduce((total,c)=>total+c.deps.length,0)} depositante(s)</span></div>
   <div className={`supervisor-grid supervisor-discovery-grid ${selected?'supervisor-grid-with-detail':''}`}>{visibleCards.map(({s,prod,rec,inv,deps,status,critCount,warnCount,fcaCount})=>{
     const isSelected=selectedSupervisorId===s.supervisorId
     return <button type="button" className={`supervisor-card supervisor-card-${status} ${isSelected?'selected':''}`} key={s.supervisorId} aria-expanded={isSelected} aria-controls={SUPERVISOR_DETAIL_ID} onClick={()=>setSelectedSupervisorId(isSelected?'':s.supervisorId)}>
       <div className="supervisor-head"><SupervisorPhoto name={s.nomeExibicao} src={s.fotoUrl}/><div><strong>{s.nomeExibicao}</strong><span>{deps.length} depositante(s) · {fcaCount} FCA(s)</span></div><span className="supervisor-card-open material-symbols-rounded" aria-hidden="true">{isSelected?'expand_less':'chevron_right'}</span></div>
       <div className={`supervisor-card-priority supervisor-card-priority-${status}`}><span>Saúde da carteira</span><strong className={`text-${status}`}>{cardBadge(critCount,warnCount,status)}</strong></div>
       <div className="supervisor-metrics"><div><span>Produção</span><b className={`text-${metricStatus(prod,metaProd)}`}>{pct(prod)}</b></div><div><span>Recebimento</span><b className={`text-${metricStatus(rec,metaRec)}`}>{pct(rec)}</b></div><div><span>Inventário</span><b className={`text-${metricStatus(inv,metaInv)}`}>{pct(inv)}</b></div></div>
       <div className="supervisor-modules">{Array.from(new Set(deps.map(d=>d.moduloId))).map(m=><span key={m}>{m}</span>)}</div>
     </button>
   })}</div>
 </section>
}