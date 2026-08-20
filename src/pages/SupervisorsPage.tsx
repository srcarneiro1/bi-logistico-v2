import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { PageHeader } from '../components/PageHeader'
import { avg, indicatorMeta, metricStatus, pct, periodKey, scoped } from '../lib/dashboard'
import { deriveFcaStatus, isFcaOverdue, listFcas } from '../lib/fca'
import type { FcaWithActions } from '../types/fca'
import type { DashboardFilters, MetricStatus } from '../types/dashboard'
import type { HubBootstrap } from '../types/hub'

const rank:Record<MetricStatus,number>={crit:3,warn:2,neutral:1,ok:0}
const label:Record<MetricStatus,string>={ok:'Dentro da meta',warn:'Atenção',crit:'Crítico',neutral:'Sem dados no período'}

export function SupervisorsPage({hub,filters}:{hub:HubBootstrap;filters:DashboardFilters}){
 const navigate=useNavigate()
 const [selectedSupervisorId,setSelectedSupervisorId]=useState(filters.supervisorId)
 const [fcas,setFcas]=useState<FcaWithActions[]>([])
 useEffect(()=>setSelectedSupervisorId(filters.supervisorId),[filters.supervisorId])
 useEffect(()=>{void listFcas().then(setFcas).catch(()=>setFcas([]))},[])
 const metaProd=indicatorMeta(hub,'Lead Time Produção'),metaRec=indicatorMeta(hub,'Lead Time Recebimento'),metaInv=indicatorMeta(hub,'Inventário')
 const scopedOp=scoped(hub.facts.kpiOperacional,filters),scopedInv=scoped(hub.facts.kpiInventarioDepositante,filters)
 const cards=hub.supervisors.map(s=>{
   const op=scopedOp.filter(r=>r.supervisorId===s.supervisorId),inv=scopedInv.filter(r=>r.supervisorId===s.supervisorId)
   const deps=hub.depositantes.filter(d=>d.supervisorId===s.supervisorId&&(!filters.moduloId||d.moduloId===filters.moduloId))
   const prod=avg(op.map(x=>x.producaoPct)),rec=avg(op.map(x=>x.recebimentoPct)),invAvg=avg(inv.map(x=>x.totalPct))
   const statuses=[metricStatus(prod,metaProd),metricStatus(rec,metaRec),metricStatus(invAvg,metaInv)]
   const status=statuses.reduce((a,b)=>rank[b]>rank[a]?b:a,'ok' as MetricStatus)
   const depStatuses=deps.map(d=>{const o=op.find(r=>r.cnpj===d.cnpj),i=inv.find(r=>r.cnpj===d.cnpj);const ss=[metricStatus(o?.producaoPct,metaProd),metricStatus(o?.recebimentoPct,metaRec),metricStatus(i?.totalPct,metaInv)];return ss.reduce((a,b)=>rank[b]>rank[a]?b:a,'ok' as MetricStatus)})
   return{s,prod,rec,inv:invAvg,deps,status,critCount:depStatuses.filter(x=>x==='crit').length,warnCount:depStatuses.filter(x=>x==='warn').length}
 }).sort((a,b)=>b.critCount-a.critCount||b.warnCount-a.warnCount||rank[b.status]-rank[a.status]||a.s.nomeExibicao.localeCompare(b.s.nomeExibicao,'pt-BR'))
 const visibleCards=filters.supervisorId?cards.filter(c=>c.s.supervisorId===filters.supervisorId):cards
 const selected=selectedSupervisorId?cards.find(c=>c.s.supervisorId===selectedSupervisorId):null
 const detailRows=selected?.deps.map(d=>{const op=scopedOp.find(r=>r.cnpj===d.cnpj),inv=scopedInv.find(r=>r.cnpj===d.cnpj);const statuses=[metricStatus(op?.producaoPct,metaProd),metricStatus(op?.recebimentoPct,metaRec),metricStatus(inv?.totalPct,metaInv)];const status=statuses.reduce((a,b)=>rank[b]>rank[a]?b:a,'ok' as MetricStatus);return{d,op,inv,status}}).sort((a,b)=>rank[b.status]-rank[a.status]||a.d.nome.localeCompare(b.d.nome,'pt-BR'))??[]
 const selectedFcas=useMemo(()=>selected?[...fcas].filter(f=>{
   if(f.supervisor_id!==selected.s.supervisorId)return false
   if(filters.moduloId&&f.modulo_id!==filters.moduloId)return false
   if(filters.periodo&&f.data_reuniao.slice(0,7)!==periodKey(filters.periodo))return false
   const status=deriveFcaStatus(f)
   return status==='ABERTO'||status==='EM_ANDAMENTO'||isFcaOverdue(f)
 }).sort((a,b)=>Number(isFcaOverdue(b))-Number(isFcaOverdue(a))||b.data_reuniao.localeCompare(a.data_reuniao)||b.numero-a.numero):[],[fcas,selected,filters.periodo,filters.moduloId])
 const cardBadge=(critCount:number,warnCount:number,status:MetricStatus)=>critCount?`${critCount} crítico${critCount>1?'s':''}`:warnCount?`${warnCount} em atenção`:label[status]
 function openDepositante(cnpj:string){sessionStorage.setItem('bi-logistico-v2:depositante',cnpj);navigate('/depositantes')}
 return <section>
   <PageHeader eyebrow="LIDERANÇA OPERACIONAL" title="Supervisores" description="Compare carteiras e abra o responsável para analisar depositantes e FCAs pendentes no escopo atual."/>
   <div className="supervisor-grid">{visibleCards.map(({s,prod,rec,inv,deps,status,critCount,warnCount})=><button className={`supervisor-card supervisor-card-${status} ${selectedSupervisorId===s.supervisorId?'selected':''}`} key={s.supervisorId} onClick={()=>setSelectedSupervisorId(selectedSupervisorId===s.supervisorId?'':s.supervisorId)}><div className="supervisor-head">{s.fotoUrl?<img src={s.fotoUrl} alt=""/>:<span className="supervisor-avatar">{s.nomeExibicao.slice(0,2).toUpperCase()}</span>}<div><strong>{s.nomeExibicao}</strong><span>{deps.length} depositante(s)</span></div><span className={`supervisor-health supervisor-health-${status}`}>{cardBadge(critCount,warnCount,status)}</span></div><div className="supervisor-metrics"><div><span>Produção</span><b className={`text-${metricStatus(prod,metaProd)}`}>{pct(prod)}</b></div><div><span>Recebimento</span><b className={`text-${metricStatus(rec,metaRec)}`}>{pct(rec)}</b></div><div><span>Inventário</span><b className={`text-${metricStatus(inv,metaInv)}`}>{pct(inv)}</b></div></div><div className="supervisor-modules">{Array.from(new Set(deps.map(d=>d.moduloId))).map(m=><span key={m}>{m}</span>)}</div></button>)}</div>
   {selected&&<div className="supervisor-detail-stack">
     <article className="dashboard-panel panel-spaced supervisor-portfolio"><div className="panel-head"><div><span className="panel-eyebrow">CARTEIRA SELECIONADA</span><h2>{selected.s.nomeExibicao} · {selected.deps.length} depositante(s)</h2></div><button className="button" onClick={()=>setSelectedSupervisorId('')}>Fechar detalhe</button></div><div className="table-wrap embedded"><table className="status-table"><thead><tr><th>Depositante</th><th>Módulo</th><th>Produção</th><th>Recebimento</th><th>Inventário</th><th>Status</th></tr></thead><tbody>{detailRows.map(({d,op,inv,status})=><tr key={d.cnpj}><td><button className="table-link" onClick={()=>openDepositante(d.cnpj)}><strong>{d.nome}</strong></button></td><td>{d.moduloId}</td><td><span className={`metric-cell metric-cell-${metricStatus(op?.producaoPct,metaProd)}`}>{pct(op?.producaoPct)}</span></td><td><span className={`metric-cell metric-cell-${metricStatus(op?.recebimentoPct,metaRec)}`}>{pct(op?.recebimentoPct)}</span></td><td><span className={`metric-cell metric-cell-${metricStatus(inv?.totalPct,metaInv)}`}>{pct(inv?.totalPct)}</span></td><td><span className={`row-status row-status-${status}`}>{label[status]}</span></td></tr>)}</tbody></table></div></article>
     <article className="dashboard-panel supervisor-open-fcas"><div className="panel-head"><div><span className="panel-eyebrow">PENDÊNCIAS DO RESPONSÁVEL</span><h2>FCAs abertos no período</h2></div><span className={`panel-chip ${selectedFcas.length?'panel-chip-red':''}`}>{selectedFcas.length} pendente(s)</span></div>{selectedFcas.length?<div className="supervisor-fca-list">{selectedFcas.map(f=>{const overdue=isFcaOverdue(f),status=overdue?'VENCIDO':deriveFcaStatus(f);return <Link key={f.id} to={`/fca/${f.id}`}><div><strong>FCA #{String(f.numero).padStart(5,'0')} · {f.depositante_nome}</strong><span>{f.indicador_nome} · {new Date(`${f.data_reuniao}T12:00:00`).toLocaleDateString('pt-BR')}</span></div><span className={`status-badge status-${status}`}>{status.replace('_',' ')}</span></Link>})}</div>:<div className="table-empty">Nenhum FCA pendente para este supervisor no filtro atual.</div>}</article>
   </div>}
 </section>
}
