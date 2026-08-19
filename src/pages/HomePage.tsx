import { MetricCard } from '../components/MetricCard'
import { PageHeader } from '../components/PageHeader'
import { SimpleLineChart } from '../components/SimpleLineChart'
import { avg, mainKpis, metricStatus, money, operationalRows, pct, revenueRows, sum, trendGlobal, trendScopedOperational } from '../lib/dashboard'
import type { DashboardFilters } from '../types/dashboard'
import type { HubBootstrap } from '../types/hub'

export function HomePage({hub,filters}:{hub:HubBootstrap;filters:DashboardFilters}){
  const kpis=mainKpis(hub,filters)
  const ops=operationalRows(hub,filters)
  const attention=ops.slice(0,6)
  const revenues=revenueRows(hub,filters)
  const plan=sum(revenues.map(r=>r.receitaPlanejada)), real=sum(revenues.map(r=>r.receitaRealizada)), attainment=plan?real/plan:null
  const useGlobal=hub.profile.perfil==='ADMIN'&&!filters.supervisorId&&!filters.moduloId&&hub.facts.kpiGeral.length>0
  const prodTrend=useGlobal?trendGlobal(hub.facts.kpiGeral,'Lead Time Produção'):trendScopedOperational(hub.facts.kpiOperacional,'producaoPct',filters)
  const recTrend=useGlobal?trendGlobal(hub.facts.kpiGeral,'Lead Time Recebimento'):trendScopedOperational(hub.facts.kpiOperacional,'recebimentoPct',filters)
  const invTrend=useGlobal?trendGlobal(hub.facts.kpiGeral,'Inventário'):[]
  return <section>
    <PageHeader eyebrow="PERFORMANCE OPERACIONAL" title="Visão geral" description="Leitura consolidada dos principais indicadores, pontos de atenção e desempenho financeiro da operação." />
    <div className="kpi-strip">{kpis.slice(0,5).map(k=><MetricCard key={k.label} label={k.label} value={pct(k.value)} status={metricStatus(k.value,k.meta)} meta={k.meta?.metaPct!=null?`Meta ${pct(k.meta.metaPct,0)}`:'Sem meta'} detail={k.meta?.criticoPct!=null?`Crítico < ${pct(k.meta.criticoPct,0)}`:undefined}/>)}</div>
    <div className="dashboard-grid grid-21">
      <article className="dashboard-panel"><div className="panel-head"><div><span className="panel-eyebrow">HISTÓRICO</span><h2>Evolução dos KPIs</h2></div><span className="panel-chip">% aderência</span></div><div className="panel-body"><SimpleLineChart series={[{label:'Produção',values:prodTrend,tone:'red'},{label:'Recebimento',values:recTrend,tone:'gray'},...(invTrend.length?[{label:'Inventário',values:invTrend,tone:'blue' as const}]:[])]}/></div></article>
      <article className="dashboard-panel"><div className="panel-head"><div><span className="panel-eyebrow">FINANCEIRO</span><h2>Receita do período</h2></div></div><div className="finance-summary"><div><span>Planejado</span><strong>{money(plan)}</strong></div><div><span>Realizado</span><strong>{money(real)}</strong></div><div className={attainment!=null&&attainment<.95?'finance-alert':''}><span>Atingimento</span><strong>{pct(attainment)}</strong></div></div><div className="progress-track"><i style={{width:`${Math.min(100,(attainment??0)*100)}%`}} /></div><p className="panel-note">{revenues.length} depositante(s) com lançamento no filtro atual.</p></article>
    </div>
    <div className="dashboard-grid grid-12">
      <article className="dashboard-panel"><div className="panel-head"><div><span className="panel-eyebrow">GESTÃO À VISTA</span><h2>Pontos de atenção</h2></div><span className="panel-chip panel-chip-red">{attention.filter(r=>Math.min(r.producaoPct??2,r.recebimentoPct??2,r.inventario?.totalPct??2)<.95).length} alertas</span></div><div className="attention-list">{attention.map((r,i)=>{const worst=Math.min(r.producaoPct??2,r.recebimentoPct??2,r.inventario?.totalPct??2);return <div className="attention-row" key={r.cnpj}><span className="rank">{String(i+1).padStart(2,'0')}</span><div><strong>{r.nomeDepositante}</strong><small>{r.moduloId}</small></div><div className="attention-metrics"><span>Prod. <b>{pct(r.producaoPct)}</b></span><span>Receb. <b>{pct(r.recebimentoPct)}</b></span><span>Inv. <b>{pct(r.inventario?.totalPct)}</b></span></div><i className={`health-dot ${worst>=.98?'ok':worst>=.95?'warn':'crit'}`}/></div>})}{!attention.length&&<div className="empty-chart">Sem dados operacionais neste período.</div>}</div></article>
      <article className="dashboard-panel"><div className="panel-head"><div><span className="panel-eyebrow">COBERTURA</span><h2>Resumo do escopo</h2></div></div><div className="scope-grid"><div><span>Depositantes</span><strong>{hub.depositantes.length}</strong></div><div><span>Supervisores</span><strong>{hub.supervisors.length}</strong></div><div><span>Módulos</span><strong>{new Set(hub.supervisorModules.map(m=>m.moduloId)).size}</strong></div><div><span>Média produção</span><strong>{pct(avg(ops.map(r=>r.producaoPct)))}</strong></div></div></article>
    </div>
  </section>
}
