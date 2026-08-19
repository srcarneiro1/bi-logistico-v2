import { PageHeader } from '../components/PageHeader'
import { avg, pct } from '../lib/dashboard'
import type { DashboardFilters } from '../types/dashboard'
import type { HubBootstrap } from '../types/hub'

export function SupervisorsPage({hub,filters,onFiltersChange}:{hub:HubBootstrap;filters:DashboardFilters;onFiltersChange:(next:DashboardFilters)=>void}){
 const cards=hub.supervisors.map(s=>{const op=hub.facts.kpiOperacional.filter(r=>(!filters.periodo||r.periodo===filters.periodo)&&r.supervisorId===s.supervisorId&&(!filters.moduloId||r.moduloId===filters.moduloId));const inv=hub.facts.kpiInventarioDepositante.filter(r=>(!filters.periodo||r.periodo===filters.periodo)&&r.supervisorId===s.supervisorId&&(!filters.moduloId||r.moduloId===filters.moduloId));const deps=hub.depositantes.filter(d=>d.supervisorId===s.supervisorId&&(!filters.moduloId||d.moduloId===filters.moduloId));return {s,prod:avg(op.map(x=>x.producaoPct)),rec:avg(op.map(x=>x.recebimentoPct)),inv:avg(inv.map(x=>x.totalPct)),deps}})
 return <section><PageHeader eyebrow="LIDERANÇA OPERACIONAL" title="Supervisores" description="Visão comparativa por responsável, módulo e carteira de depositantes."/>
 <div className="supervisor-grid">{cards.map(({s,prod,rec,inv,deps})=><button className={`supervisor-card ${filters.supervisorId===s.supervisorId?'selected':''}`} key={s.supervisorId} onClick={()=>onFiltersChange({...filters,supervisorId:filters.supervisorId===s.supervisorId?'':s.supervisorId,moduloId:''})}><div className="supervisor-head">{s.fotoUrl?<img src={s.fotoUrl} alt=""/>:<span className="supervisor-avatar">{s.nomeExibicao.slice(0,2).toUpperCase()}</span>}<div><strong>{s.nomeExibicao}</strong><span>{deps.length} depositante(s)</span></div></div><div className="supervisor-metrics"><div><span>Produção</span><b>{pct(prod)}</b></div><div><span>Recebimento</span><b>{pct(rec)}</b></div><div><span>Inventário</span><b>{pct(inv)}</b></div></div><div className="supervisor-modules">{Array.from(new Set(deps.map(d=>d.moduloId))).map(m=><span key={m}>{m}</span>)}</div></button>)}</div>
 </section>
}
