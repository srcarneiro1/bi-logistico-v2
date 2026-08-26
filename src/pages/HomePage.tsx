import { MetricCard } from '../components/MetricCard'
import { PageHeader } from '../components/PageHeader'
import { SimpleLineChart } from '../components/SimpleLineChart'
import { MetricStatusBadge } from '../components/ui/Badge'
import { avg, indicatorMeta, kpiComparison, mainKpis, metricStatus, money, operationalRows, pct, periodKey, periodLabel, revenueRows, sum, trendGlobal, trendScopedOperational } from '../lib/dashboard'
import type { DashboardFilters } from '../types/dashboard'
import type { HubBootstrap } from '../types/hub'

function historyWindow<T extends {periodo:string}>(series:T[],periodo:string,max=18){const key=periodKey(periodo);return series.filter(x=>!key||periodKey(x.periodo)<=key).slice(-max)}

export function HomePage({hub,filters}:{hub:HubBootstrap;filters:DashboardFilters}){
  const kpis=mainKpis(hub,filters),ops=operationalRows(hub,filters),revenues=revenueRows(hub,filters)
  const plan=sum(revenues.map(r=>r.receitaPlanejada)),real=sum(revenues.map(r=>r.receitaRealizada)),attainment=plan?real/plan:null
  const useGlobal=hub.profile.perfil==='ADMIN'&&!filters.supervisorId&&!filters.moduloId&&hub.facts.kpiGeral.length>0
  const prodTrend=historyWindow(useGlobal?trendGlobal(hub.facts.kpiGeral,'Lead Time Produção'):trendScopedOperational(hub.facts.kpiOperacional,'producaoPct',filters),filters.periodo)
  const recTrend=historyWindow(useGlobal?trendGlobal(hub.facts.kpiGeral,'Lead Time Recebimento'):trendScopedOperational(hub.facts.kpiOperacional,'recebimentoPct',filters),filters.periodo)
  const invTrend=historyWindow(useGlobal?trendGlobal(hub.facts.kpiGeral,'Inventário'):[],filters.periodo)
  const prodMeta=indicatorMeta(hub,'Lead Time Produção'),recMeta=indicatorMeta(hub,'Lead Time Recebimento'),invMeta=indicatorMeta(hub,'Inventário')
  const attentionRows=ops.map(row=>{const statuses=[metricStatus(row.producaoPct,prodMeta),metricStatus(row.recebimentoPct,recMeta),metricStatus(row.inventario?.totalPct,invMeta)];const score=statuses.includes('crit')?2:statuses.includes('warn')?1:0;return {...row,attentionScore:score}}).filter(row=>row.attentionScore>0).sort((a,b)=>b.attentionScore-a.attentionScore)
  const attention=attentionRows.slice(0,6)
  const scopeDepositantes=new Set(ops.map(r=>r.cnpj)).size,scopeSupervisors=new Set(ops.map(r=>r.supervisorId)).size,scopeModules=new Set(ops.map(r=>r.moduloId)).size
  const financeGood=attainment!=null&&attainment>=1
  const renderMetric=(k:(typeof kpis)[number])=>{const c=kpiComparison(hub,filters,k.label,k.value);return <MetricCard key={k.label} variant="supporting" label={k.label} value={pct(k.value)} status={metricStatus(k.value,k.meta)} meta={k.meta?.metaPct!=null?`Meta ${pct(k.meta.metaPct)}`:'Sem meta'} detail={k.meta?.criticoPct!=null?`Crítico < ${pct(k.meta.criticoPct)}`:undefined} delta={c.delta} gap={c.gap}/>}
  return <section className="home-dashboard">
    <PageHeader eyebrow="PERFORMANCE OPERACIONAL" title="Visão geral" description="Leitura consolidada dos principais indicadores, pontos de atenção e desempenho financeiro no escopo selecionado." />

    <section className="home-kpi-section" aria-labelledby="home-kpi-title">
      <div className="home-section-heading"><div><span className="panel-eyebrow">INDICADORES-CHAVE</span><h2 id="home-kpi-title">Performance do período</h2><p>Compare os principais indicadores do período em uma única leitura.</p></div>{filters.periodo&&<span className="panel-chip">{periodLabel(filters.periodo)}</span>}</div>
      <div className="home-kpi-grid">{kpis.slice(0,5).map(renderMetric)}</div>
    </section>

    <div className="home-main-grid">
      <article className="dashboard-panel home-trend-panel"><div className="panel-head"><div><span className="panel-eyebrow">HISTÓRICO ATÉ O PERÍODO</span><h2>Evolução dos KPIs</h2></div><span className="panel-chip">últimos {Math.max(prodTrend.length,recTrend.length,invTrend.length)} meses</span></div><div className="panel-body"><SimpleLineChart series={[{label:'Produção',values:prodTrend,tone:'red'},{label:'Recebimento',values:recTrend,tone:'gray'},...(invTrend.length?[{label:'Inventário',values:invTrend,tone:'blue' as const}]:[])]}/></div></article>
      <div className="home-side-stack">
        <article className="dashboard-panel"><div className="panel-head"><div><span className="panel-eyebrow">FINANCEIRO</span><h2>Receita do período</h2></div>{attainment!=null&&<span className={`panel-chip ${financeGood?'panel-chip-ok':attainment<.95?'panel-chip-red':''}`}>{financeGood?'Acima do planejado':attainment<.95?'Abaixo do planejado':'Dentro da faixa'}</span>}</div><div className="finance-summary"><div><span>Planejado</span><strong>{money(plan)}</strong></div><div><span>Realizado</span><strong>{money(real)}</strong></div><div className={attainment!=null&&attainment<.95?'finance-alert':''}><span>Atingimento</span><strong className={financeGood?'text-ok':''}>{pct(attainment)}</strong></div></div><div className={`progress-track ${financeGood?'good':''}`}><i style={{width:`${Math.min(100,(attainment??0)*100)}%`}} /></div><p className="panel-note">{revenues.length} depositante(s) com lançamento no escopo atual.</p></article>
        <article className="dashboard-panel home-scope-panel"><div className="panel-head"><div><span className="panel-eyebrow">ESCOPO</span><h2>Resumo da seleção</h2></div><span className="panel-chip">filtro atual</span></div><div className="scope-grid home-scope-grid"><div><span>Depositantes</span><strong>{scopeDepositantes}</strong></div><div><span>Supervisores</span><strong>{scopeSupervisors}</strong></div><div><span>Módulos</span><strong>{scopeModules}</strong></div><div><span>Média produção</span><strong>{pct(avg(ops.map(r=>r.producaoPct)))}</strong></div></div></article>
      </div>
    </div>

    <article className="dashboard-panel home-attention-panel"><div className="panel-head"><div><span className="panel-eyebrow">GESTÃO À VISTA</span><h2>Pontos de atenção</h2></div><span className={`panel-chip ${attentionRows.length?'panel-chip-red':''}`}>{attentionRows.length} alertas</span></div><div className="attention-list">{attention.map((r,i)=>{const statuses=[metricStatus(r.producaoPct,prodMeta),metricStatus(r.recebimentoPct,recMeta),metricStatus(r.inventario?.totalPct,invMeta)];const rowStatus=statuses.includes('crit')?'crit':'warn';return <div className="attention-row" key={r.cnpj}><span className="rank">{String(i+1).padStart(2,'0')}</span><div><strong>{r.nomeDepositante}</strong><small>{r.moduloId}</small></div><div className="attention-metrics"><span>Prod. <b className={`text-${metricStatus(r.producaoPct,prodMeta)}`}>{pct(r.producaoPct)}</b></span><span>Receb. <b className={`text-${metricStatus(r.recebimentoPct,recMeta)}`}>{pct(r.recebimentoPct)}</b></span><span>Inv. <b className={`text-${metricStatus(r.inventario?.totalPct,invMeta)}`}>{pct(r.inventario?.totalPct)}</b></span></div><MetricStatusBadge status={rowStatus} label={rowStatus==='crit'?'Crítico':'Atenção'} className="attention-status"/></div>})}{!attention.length&&<div className="empty-chart">Nenhum desvio relevante no escopo atual.</div>}</div></article>
  </section>
}
