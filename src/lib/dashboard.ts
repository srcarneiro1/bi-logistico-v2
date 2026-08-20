import type { DashboardFilters, MetricStatus } from '../types/dashboard'
import type { HubBootstrap, HubIndicador, HubKpiGeral, HubKpiInventario, HubKpiInventarioDepositante, HubKpiOperacional, HubReceita } from '../types/hub'

const monthMap: Record<string, number> = { jan:1, fev:2, mar:3, abr:4, mai:5, jun:6, jul:7, ago:8, set:9, out:10, nov:11, dez:12 }

export function periodKey(periodo:string) {
  const text = periodo.toLocaleLowerCase('pt-BR').normalize('NFD').replace(/[\u0300-\u036f]/g,'')
  const m = text.match(/([a-z]{3})\.?\/?(\d{4})/)
  if (!m) return periodo
  const month = monthMap[m[1]] ?? 0
  return `${m[2]}-${String(month).padStart(2,'0')}`
}
export function periodLabel(periodo:string) {
  const key = periodKey(periodo)
  if (!/^\d{4}-\d{2}$/.test(key)) return periodo
  return new Date(`${key}-01T12:00:00`).toLocaleDateString('pt-BR',{month:'short',year:'numeric'}).replace('. de','').replace(' de ',' ')
}
export function getAvailablePeriods(hub:HubBootstrap) {
  const all = [
    ...hub.facts.kpiGeral.map(x=>x.periodo), ...hub.facts.kpiInventario.map(x=>x.periodo),
    ...hub.facts.kpiOperacional.map(x=>x.periodo), ...hub.facts.kpiInventarioDepositante.map(x=>x.periodo),
    ...hub.facts.receita.map(x=>x.periodo), ...hub.facts.despesa.map(x=>x.periodo),
  ]
  return Array.from(new Set(all)).map(value=>({value,key:periodKey(value),label:periodLabel(value)})).sort((a,b)=>b.key.localeCompare(a.key))
}
export const pct = (value:number|null|undefined, digits=1) => value == null ? '—' : value.toLocaleString('pt-BR',{style:'percent',minimumFractionDigits:digits,maximumFractionDigits:digits})
export const pp = (value:number|null|undefined) => value == null ? '—' : `${value>=0?'+':''}${(value*100).toLocaleString('pt-BR',{minimumFractionDigits:1,maximumFractionDigits:1})} p.p.`
export const money = (value:number|null|undefined) => value == null ? '—' : value.toLocaleString('pt-BR',{style:'currency',currency:'BRL',maximumFractionDigits:0})
export function avg(values:Array<number|null|undefined>) { const valid=values.filter((v):v is number=>typeof v==='number'&&Number.isFinite(v)); return valid.length ? valid.reduce((a,b)=>a+b,0)/valid.length : null }
export function sum(values:Array<number|null|undefined>) { return values.reduce<number>((total,v)=>total+(typeof v==='number'&&Number.isFinite(v)?v:0),0) }

export function scoped<T extends {periodo:string; supervisorId?:string; moduloId?:string}>(rows:T[], filters:DashboardFilters) {
  return rows.filter(row => (!filters.periodo || row.periodo===filters.periodo) && (!filters.supervisorId || row.supervisorId===filters.supervisorId) && (!filters.moduloId || row.moduloId===filters.moduloId))
}
export function indicatorMeta(hub:HubBootstrap, name:string): HubIndicador | undefined {
  const key = normalize(name)
  return hub.indicadores.find(i=>normalize(i.indicador)===key)
}
function normalize(v:string){return v.toLocaleLowerCase('pt-BR').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]/g,'')}
export function metricStatus(value:number|null|undefined, meta?:HubIndicador):MetricStatus {
  if (value==null) return 'neutral'
  if (!meta || meta.metaPct==null || meta.criticoPct==null) return 'neutral'
  if (value>=meta.metaPct) return 'ok'
  if (value<meta.criticoPct) return 'crit'
  return 'warn'
}
export function mainKpis(hub:HubBootstrap, filters:DashboardFilters) {
  const global = hub.facts.kpiGeral.filter(r=>!filters.periodo||r.periodo===filters.periodo)
  if (global.length && hub.profile.perfil==='ADMIN' && !filters.supervisorId && !filters.moduloId) return global.map(r=>({label:r.kpi,value:r.valorPct,meta:indicatorMeta(hub,r.kpi)}))
  const op=scoped(hub.facts.kpiOperacional,filters), inv=scoped(hub.facts.kpiInventarioDepositante,filters)
  return [
    {label:'Lead Time Produção',value:avg(op.map(r=>r.producaoPct)),meta:indicatorMeta(hub,'Lead Time Produção')},
    {label:'Lead Time Recebimento',value:avg(op.map(r=>r.recebimentoPct)),meta:indicatorMeta(hub,'Lead Time Recebimento')},
    {label:'Inventário',value:avg(inv.map(r=>r.totalPct)),meta:indicatorMeta(hub,'Inventário')},
  ]
}
export function operationalRows(hub:HubBootstrap, filters:DashboardFilters) {
  const op=scoped(hub.facts.kpiOperacional,filters), inv=scoped(hub.facts.kpiInventarioDepositante,filters)
  const invBy=new Map(inv.map(r=>[r.cnpj,r]))
  return op.map(row=>({ ...row, inventario:invBy.get(row.cnpj) })).sort((a,b)=>Math.min(a.producaoPct??2,a.recebimentoPct??2,a.inventario?.totalPct??2)-Math.min(b.producaoPct??2,b.recebimentoPct??2,b.inventario?.totalPct??2))
}
export function revenueRows(hub:HubBootstrap,filters:DashboardFilters):HubReceita[]{return scoped(hub.facts.receita,filters).sort((a,b)=>(b.receitaRealizada??0)-(a.receitaRealizada??0))}
export function trendGlobal(rows:HubKpiGeral[], name:string){ return rows.filter(r=>normalize(r.kpi)===normalize(name)).sort((a,b)=>periodKey(a.periodo).localeCompare(periodKey(b.periodo))).map(r=>({periodo:r.periodo,value:r.valorPct})) }
export function trendInventory(rows:HubKpiInventario[], name:string){ return rows.filter(r=>normalize(r.kpiTipo)===normalize(name)).sort((a,b)=>periodKey(a.periodo).localeCompare(periodKey(b.periodo))).map(r=>({periodo:r.periodo,value:r.valorPct})) }
export function trendScopedOperational(rows:HubKpiOperacional[], field:'producaoPct'|'recebimentoPct',filters:DashboardFilters){
  const filtered=rows.filter(r=>(!filters.supervisorId||r.supervisorId===filters.supervisorId)&&(!filters.moduloId||r.moduloId===filters.moduloId))
  const grouped=new Map<string,number[]>()
  filtered.forEach(r=>{const v=r[field]; if(v!=null){const a=grouped.get(r.periodo)||[]; a.push(v); grouped.set(r.periodo,a)}})
  return Array.from(grouped,([periodo,values])=>({periodo,value:avg(values)})).sort((a,b)=>periodKey(a.periodo).localeCompare(periodKey(b.periodo)))
}
export function trendScopedInventory(rows:HubKpiInventarioDepositante[],filters:DashboardFilters){
  const filtered=rows.filter(r=>(!filters.supervisorId||r.supervisorId===filters.supervisorId)&&(!filters.moduloId||r.moduloId===filters.moduloId))
  const grouped=new Map<string,number[]>()
  filtered.forEach(r=>{if(r.totalPct!=null){const a=grouped.get(r.periodo)||[];a.push(r.totalPct);grouped.set(r.periodo,a)}})
  return Array.from(grouped,([periodo,values])=>({periodo,value:avg(values)})).sort((a,b)=>periodKey(a.periodo).localeCompare(periodKey(b.periodo)))
}
export function inventoryAggregate(rows:HubKpiInventarioDepositante[],filters:DashboardFilters){const r=scoped(rows,filters);return {prazo:avg(r.map(x=>x.prazoPct)),endereco:avg(r.map(x=>x.enderecoPct)),unidade:avg(r.map(x=>x.unidadePct)),sku:avg(r.map(x=>x.skuPct)),total:avg(r.map(x=>x.totalPct))}}

export function kpiComparison(hub:HubBootstrap,filters:DashboardFilters,name:string,current:number|null|undefined){
  const global=hub.profile.perfil==='ADMIN'&&!filters.supervisorId&&!filters.moduloId
  let series:Array<{periodo:string;value:number|null}>=[]
  if(normalize(name)===normalize('Lead Time Produção')) series=global?trendGlobal(hub.facts.kpiGeral,name):trendScopedOperational(hub.facts.kpiOperacional,'producaoPct',filters)
  else if(normalize(name)===normalize('Lead Time Recebimento')) series=global?trendGlobal(hub.facts.kpiGeral,name):trendScopedOperational(hub.facts.kpiOperacional,'recebimentoPct',filters)
  else if(normalize(name)===normalize('Inventário')) series=global?trendGlobal(hub.facts.kpiGeral,name):trendScopedInventory(hub.facts.kpiInventarioDepositante,filters)
  else if(global) series=trendGlobal(hub.facts.kpiGeral,name)
  const sorted=series.slice().sort((a,b)=>periodKey(a.periodo).localeCompare(periodKey(b.periodo)))
  const targetKey=filters.periodo?periodKey(filters.periodo):(sorted.at(-1)?.periodo?periodKey(sorted.at(-1)!.periodo):'')
  const idx=sorted.findIndex(x=>periodKey(x.periodo)===targetKey)
  const previous=idx>0?sorted[idx-1]?.value:null
  const meta=indicatorMeta(hub,name)?.metaPct??null
  return {previous,delta:current!=null&&previous!=null?current-previous:null,gap:current!=null&&meta!=null?current-meta:null}
}
