import { MetricCard } from '../components/MetricCard'
import { PageHeader } from '../components/PageHeader'
import { SimpleLineChart } from '../components/SimpleLineChart'
import { indicatorMeta, inventoryAggregate, mainKpis, metricStatus, operationalRows, pct, trendGlobal, trendInventory, trendScopedOperational } from '../lib/dashboard'
import type { DashboardFilters } from '../types/dashboard'
import type { HubBootstrap } from '../types/hub'

export function KpisPage({hub,filters}:{hub:HubBootstrap;filters:DashboardFilters}){
 const kpis=mainKpis(hub,filters), inv=inventoryAggregate(hub.facts.kpiInventarioDepositante,filters), ops=operationalRows(hub,filters)
 const isGlobal=hub.profile.perfil==='ADMIN'&&!filters.supervisorId&&!filters.moduloId
 const prod=isGlobal?trendGlobal(hub.facts.kpiGeral,'Lead Time Produção'):trendScopedOperational(hub.facts.kpiOperacional,'producaoPct',filters)
 const rec=isGlobal?trendGlobal(hub.facts.kpiGeral,'Lead Time Recebimento'):trendScopedOperational(hub.facts.kpiOperacional,'recebimentoPct',filters)
 const invSeries=['Prazo','Endereço','Unidade','SKU'].map((name,i)=>({label:name,values:isGlobal?trendInventory(hub.facts.kpiInventario,name):[],tone:(['red','gray','blue','yellow'][i] as 'red'|'gray'|'blue'|'yellow')}))
 return <section><PageHeader eyebrow="INDICADORES" title="KPIs operacionais" description="Metas, criticidade e evolução dos indicadores usados na gestão logística."/>
 <div className="kpi-strip">{kpis.slice(0,5).map(k=><MetricCard key={k.label} label={k.label} value={pct(k.value)} status={metricStatus(k.value,k.meta)} meta={k.meta?.metaPct!=null?`Meta ${pct(k.meta.metaPct,0)}`:''}/>)}</div>
 <div className="dashboard-grid grid-2"><article className="dashboard-panel"><div className="panel-head"><div><span className="panel-eyebrow">TENDÊNCIA</span><h2>Lead times</h2></div></div><div className="panel-body"><SimpleLineChart series={[{label:'Produção',values:prod,tone:'red'},{label:'Recebimento',values:rec,tone:'gray'}]}/></div></article><article className="dashboard-panel"><div className="panel-head"><div><span className="panel-eyebrow">INVENTÁRIO</span><h2>Sub-KPIs</h2></div></div><div className="inventory-kpi-grid">{[['Prazo',inv.prazo],['Endereço',inv.endereco],['Unidade',inv.unidade],['SKU',inv.sku],['Pontuação',inv.total]].map(([label,value])=>{const v=value as number|null;const labelText=String(label);const meta=indicatorMeta(hub,labelText==='Pontuação'?'Pontuação Total':labelText);return <div key={labelText}><span>{labelText}</span><strong className={`text-${metricStatus(v,meta)}`}>{pct(v)}</strong><small>{meta?.metaPct!=null?`meta ${pct(meta.metaPct,0)}`:'média do período'}</small></div>})}</div></article></div>
 {isGlobal&&hub.facts.kpiInventario.length>0&&<article className="dashboard-panel panel-spaced"><div className="panel-head"><div><span className="panel-eyebrow">HISTÓRICO DE INVENTÁRIO</span><h2>Evolução dos sub-KPIs</h2></div></div><div className="panel-body"><SimpleLineChart series={invSeries}/></div></article>}
 <article className="dashboard-panel panel-spaced"><div className="panel-head"><div><span className="panel-eyebrow">BASE OPERACIONAL</span><h2>Performance por depositante</h2></div><span className="panel-chip">{ops.length} linhas</span></div><div className="table-wrap embedded"><table><thead><tr><th>Depositante</th><th>Módulo</th><th>Produção</th><th>Recebimento</th><th>Inventário</th></tr></thead><tbody>{ops.map(r=><tr key={r.cnpj}><td><strong>{r.nomeDepositante}</strong></td><td>{r.moduloId}</td><td>{pct(r.producaoPct)}</td><td>{pct(r.recebimentoPct)}</td><td>{pct(r.inventario?.totalPct)}</td></tr>)}{!ops.length&&<tr><td colSpan={5} className="table-empty">Sem dados para o filtro atual.</td></tr>}</tbody></table></div></article>
 </section>
}
