import { MetricCard } from '../components/MetricCard'
import { PageHeader } from '../components/PageHeader'
import { SimpleLineChart } from '../components/SimpleLineChart'
import { MetricStatusBadge } from '../components/ui/Badge'
import { indicatorMeta, inventoryAggregate, kpiComparison, mainKpis, metricStatus, operationalRows, pct, periodKey, periodLabel, trendGlobal, trendInventory, trendScopedOperational } from '../lib/dashboard'
import type { DashboardFilters, MetricStatus } from '../types/dashboard'
import type { HubBootstrap } from '../types/hub'

const statusLabel:Record<MetricStatus,string>={ok:'Dentro da meta',warn:'Atenção',crit:'Crítico',neutral:'Sem dados no período'}
const rank:Record<MetricStatus,number>={crit:3,warn:2,neutral:1,ok:0}
function historyWindow<T extends {periodo:string}>(series:T[],periodo:string,max=18){const key=periodKey(periodo);return series.filter(x=>!key||periodKey(x.periodo)<=key).slice(-max)}

export function KpisPage({hub,filters}:{hub:HubBootstrap;filters:DashboardFilters}){
 const kpis=mainKpis(hub,filters),inv=inventoryAggregate(hub.facts.kpiInventarioDepositante,filters),ops=operationalRows(hub,filters)
 const isGlobal=hub.profile.perfil==='ADMIN'&&!filters.supervisorId&&!filters.moduloId
 const prod=historyWindow(isGlobal?trendGlobal(hub.facts.kpiGeral,'Lead Time Produção'):trendScopedOperational(hub.facts.kpiOperacional,'producaoPct',filters),filters.periodo)
 const rec=historyWindow(isGlobal?trendGlobal(hub.facts.kpiGeral,'Lead Time Recebimento'):trendScopedOperational(hub.facts.kpiOperacional,'recebimentoPct',filters),filters.periodo)
 const invSeries=['Prazo','Endereço','Unidade','SKU'].map((name,i)=>({label:name,values:historyWindow(isGlobal?trendInventory(hub.facts.kpiInventario,name):[],filters.periodo),tone:(['red','gray','blue','yellow'][i] as 'red'|'gray'|'blue'|'yellow')}))
 const metaProd=indicatorMeta(hub,'Lead Time Produção'),metaRec=indicatorMeta(hub,'Lead Time Recebimento'),metaInv=indicatorMeta(hub,'Inventário')
 const rows=ops.map(r=>{const statuses=[metricStatus(r.producaoPct,metaProd),metricStatus(r.recebimentoPct,metaRec),metricStatus(r.inventario?.totalPct,metaInv)];const worst=statuses.reduce((a,b)=>rank[b]>rank[a]?b:a,'ok' as MetricStatus);return {...r,statusProd:statuses[0],statusRec:statuses[1],statusInv:statuses[2],status:worst}}).sort((a,b)=>rank[b.status]-rank[a.status])
 const inventoryScoreMeta=indicatorMeta(hub,'Pontuação Total')??metaInv
 const periodText=filters.periodo?periodLabel(filters.periodo):'último período'
 return <section className="kpis-page">
  <PageHeader eyebrow="INDICADORES" title="KPIs operacionais" description="Metas, criticidade e evolução dos indicadores no escopo selecionado."/>

  <section className="kpis-overview" aria-labelledby="kpis-overview-title">
   <div className="kpis-section-heading"><div><span>VISÃO DO PERÍODO</span><h2 id="kpis-overview-title">Indicadores consolidados</h2></div><small>{periodText}</small></div>
   <div className="kpis-compact-grid">{kpis.slice(0,5).map(k=>{const c=kpiComparison(hub,filters,k.label,k.value);return <MetricCard key={k.label} variant="supporting" label={k.label} value={pct(k.value)} status={metricStatus(k.value,k.meta)} meta={k.meta?.metaPct!=null?`Meta ${pct(k.meta.metaPct)}`:'Sem meta'} delta={c.delta} gap={c.gap}/>})}</div>
  </section>

  <div className="kpis-analysis-grid">
   <article className="dashboard-panel kpis-leadtime-panel"><div className="panel-head"><div><span className="panel-eyebrow">HISTÓRICO ATÉ O PERÍODO</span><h2>Evolução dos lead times</h2></div><span className="panel-chip">até {periodText}</span></div><div className="panel-body"><SimpleLineChart series={[{label:'Produção',values:prod,tone:'red'},{label:'Recebimento',values:rec,tone:'gray'}]}/></div></article>
   <article className="dashboard-panel kpis-inventory-panel"><div className="panel-head"><div><span className="panel-eyebrow">INVENTÁRIO</span><h2>Composição do indicador</h2></div></div><div className="inventory-score"><span>Pontuação do período</span><strong className={`text-${metricStatus(inv.total,inventoryScoreMeta)}`}>{pct(inv.total)}</strong><small>{inventoryScoreMeta?.metaPct!=null?`Meta ${pct(inventoryScoreMeta.metaPct)}`:'Média consolidada'}</small></div><div className="inventory-support-grid">{[['Prazo',inv.prazo],['Endereço',inv.endereco],['Unidade',inv.unidade],['SKU',inv.sku]].map(([label,value])=>{const v=value as number|null,labelText=String(label),meta=indicatorMeta(hub,labelText);return <div key={labelText}><span>{labelText}</span><strong className={`text-${metricStatus(v,meta)}`}>{pct(v)}</strong><small>{meta?.metaPct!=null?`Meta ${pct(meta.metaPct)}`:'Média do período'}</small></div>})}</div></article>
  </div>

  {isGlobal&&hub.facts.kpiInventario.length>0&&<article className="dashboard-panel kpis-history-panel"><div className="panel-head"><div><span className="panel-eyebrow">HISTÓRICO ATÉ O PERÍODO</span><h2>Evolução dos sub-KPIs de inventário</h2></div><span className="panel-chip">4 dimensões</span></div><div className="panel-body"><SimpleLineChart series={invSeries}/></div></article>}

  <article className="dashboard-panel kpis-table-panel"><div className="panel-head"><div><span className="panel-eyebrow">BASE OPERACIONAL</span><h2>Performance por depositante</h2></div><span className="panel-chip">{rows.length} depositantes</span></div><div className="table-wrap embedded"><table className="status-table responsive-data-table"><thead><tr><th scope="col">Depositante</th><th scope="col">Módulo</th><th scope="col">Produção</th><th scope="col">Recebimento</th><th scope="col">Inventário</th><th scope="col">Status</th></tr></thead><tbody>{rows.map(r=><tr key={r.cnpj}><td data-label="Depositante" data-primary="true"><strong>{r.nomeDepositante}</strong></td><td data-label="Módulo">{r.moduloId}</td><td data-label="Produção"><span className={`metric-cell metric-cell-${r.statusProd}`}>{pct(r.producaoPct)}</span></td><td data-label="Recebimento"><span className={`metric-cell metric-cell-${r.statusRec}`}>{pct(r.recebimentoPct)}</span></td><td data-label="Inventário"><span className={`metric-cell metric-cell-${r.statusInv}`}>{pct(r.inventario?.totalPct)}</span></td><td data-label="Status"><MetricStatusBadge status={r.status} label={statusLabel[r.status]}/></td></tr>)}{!rows.length&&<tr><td colSpan={6} className="table-empty">Sem dados para o escopo atual.</td></tr>}</tbody></table></div></article>
 </section>
}
