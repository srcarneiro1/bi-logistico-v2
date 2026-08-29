import { MetricCard } from '../components/MetricCard'
import { PageHeader } from '../components/PageHeader'
import { SimpleLineChart } from '../components/SimpleLineChart'
import { MetricStatusBadge } from '../components/ui/Badge'
import { Chip } from '../components/ui/Chip'
import { EmptyState } from '../components/ui/Feedback'
import { Panel, PanelHeader } from '../components/ui/Panel'
import { SectionHeader } from '../components/ui/SectionHeader'
import { avg, indicatorMeta, kpiComparison, mainKpis, metricStatus, money, operationalRows, pct, periodKey, periodLabel, revenueRows, sum, trendGlobal, trendScopedInventory, trendScopedOperational } from '../lib/dashboard'
import type { DashboardFilters } from '../types/dashboard'
import type { HubBootstrap } from '../types/hub'

function historyWindow<T extends {periodo:string}>(series:T[],periodo:string,max=18){const key=periodKey(periodo);return series.filter(x=>!key||periodKey(x.periodo)<=key).slice(-max)}

export function HomePage({hub,filters}:{hub:HubBootstrap;filters:DashboardFilters}){
  const kpis=mainKpis(hub,filters),ops=operationalRows(hub,filters),revenues=revenueRows(hub,filters)
  const plan=sum(revenues.map(r=>r.receitaPlanejada)),real=sum(revenues.map(r=>r.receitaRealizada)),attainment=plan?real/plan:null
  const useGlobal=hub.profile.perfil==='ADMIN'&&!filters.supervisorId&&!filters.moduloId&&hub.facts.kpiGeral.length>0
  const prodTrend=historyWindow(useGlobal?trendGlobal(hub.facts.kpiGeral,'Lead Time Produção'):trendScopedOperational(hub.facts.kpiOperacional,'producaoPct',filters),filters.periodo)
  const recTrend=historyWindow(useGlobal?trendGlobal(hub.facts.kpiGeral,'Lead Time Recebimento'):trendScopedOperational(hub.facts.kpiOperacional,'recebimentoPct',filters),filters.periodo)
  const invTrend=historyWindow(useGlobal?trendGlobal(hub.facts.kpiGeral,'Inventário'):trendScopedInventory(hub.facts.kpiInventarioDepositante,filters),filters.periodo)
  const prodMeta=indicatorMeta(hub,'Lead Time Produção'),recMeta=indicatorMeta(hub,'Lead Time Recebimento'),invMeta=indicatorMeta(hub,'Inventário')
  const attentionRows=ops.map(row=>{const statuses=[metricStatus(row.producaoPct,prodMeta),metricStatus(row.recebimentoPct,recMeta),metricStatus(row.inventario?.totalPct,invMeta)];const score=statuses.includes('crit')?2:statuses.includes('warn')?1:0;return {...row,attentionScore:score}}).filter(row=>row.attentionScore>0).sort((a,b)=>b.attentionScore-a.attentionScore)
  const attention=attentionRows.slice(0,6)
  const scopeDepositantes=new Set(ops.map(r=>r.cnpj)).size,scopeSupervisors=new Set(ops.map(r=>r.supervisorId)).size,scopeModules=new Set(ops.map(r=>r.moduloId)).size
  const financeGood=attainment!=null&&attainment>=1
  const renderMetric=(k:(typeof kpis)[number])=>{const c=kpiComparison(hub,filters,k.label,k.value);return <MetricCard key={k.label} variant="supporting" label={k.label} value={pct(k.value)} status={metricStatus(k.value,k.meta)} meta={k.meta?.metaPct!=null?`Meta ${pct(k.meta.metaPct)}`:'Sem meta'} detail={k.meta?.criticoPct!=null?`Crítico < ${pct(k.meta.criticoPct)}`:undefined} delta={c.delta} gap={c.gap}/>}
  return <section className="home-dashboard">
    <PageHeader eyebrow="PERFORMANCE OPERACIONAL" title="Visão geral" description="Leitura consolidada dos principais indicadores, pontos de atenção e desempenho financeiro no escopo selecionado." />

    <section className="home-kpi-section" aria-labelledby="home-kpi-title">
      <SectionHeader eyebrow="INDICADORES-CHAVE" title="Performance do período" titleId="home-kpi-title" description="Compare os principais indicadores do período em uma única leitura." trailing={filters.periodo?<Chip>{periodLabel(filters.periodo)}</Chip>:undefined}/>
      <div className="home-kpi-grid">{kpis.slice(0,5).map(renderMetric)}</div>
    </section>

    <div className="home-main-grid">
      <Panel as="article" className="home-trend-panel"><PanelHeader eyebrow="HISTÓRICO ATÉ O PERÍODO" title="Evolução dos KPIs" trailing={<Chip>últimos {Math.max(prodTrend.length,recTrend.length,invTrend.length)} meses</Chip>}/><div className="panel-body"><SimpleLineChart series={[{label:'Produção',values:prodTrend,tone:'red'},{label:'Recebimento',values:recTrend,tone:'gray'},...(invTrend.length?[{label:'Inventário',values:invTrend,tone:'blue' as const}]:[])]}/></div></Panel>
      <div className="home-side-stack">
        <Panel as="article"><PanelHeader eyebrow="FINANCEIRO" title="Receita do período" trailing={attainment!=null?<Chip tone={financeGood?'success':attainment<.95?'danger':'neutral'}>{financeGood?'Acima do planejado':attainment<.95?'Abaixo do planejado':'Dentro da faixa'}</Chip>:undefined}/><div className="finance-summary"><div><span>Planejado</span><strong>{money(plan)}</strong></div><div><span>Realizado</span><strong>{money(real)}</strong></div><div className={attainment!=null&&attainment<.95?'finance-alert':''}><span>Atingimento</span><strong className={financeGood?'text-ok':''}>{pct(attainment)}</strong></div></div><div className={`progress-track ${financeGood?'good':''}`}><i style={{width:`${Math.min(100,(attainment??0)*100)}%`}} /></div><p className="panel-note">{revenues.length} depositante(s) com lançamento no escopo atual.</p></Panel>
        <Panel as="article" className="home-scope-panel"><PanelHeader eyebrow="ESCOPO" title="Resumo da seleção" trailing={<Chip>filtro atual</Chip>}/><div className="home-scope-grid"><div><span>Depositantes</span><strong>{scopeDepositantes}</strong></div><div><span>Supervisores</span><strong>{scopeSupervisors}</strong></div><div><span>Módulos</span><strong>{scopeModules}</strong></div><div><span>Média produção</span><strong>{pct(avg(ops.map(r=>r.producaoPct)))}</strong></div></div></Panel>
      </div>
    </div>

    <Panel as="article" className="home-attention-panel"><PanelHeader eyebrow="GESTÃO À VISTA" title="Pontos de atenção" trailing={<Chip tone={attentionRows.length?'danger':'neutral'}>{attentionRows.length} alertas</Chip>}/>{attention.length?<div className="attention-list">{attention.map((r,i)=>{const statuses=[metricStatus(r.producaoPct,prodMeta),metricStatus(r.recebimentoPct,recMeta),metricStatus(r.inventario?.totalPct,invMeta)];const rowStatus=statuses.includes('crit')?'crit':'warn';const rowKey=[periodKey(r.periodo),r.cnpj,r.supervisorId,r.moduloId].join(':');return <div className="attention-row" key={rowKey}><span className="rank">{String(i+1).padStart(2,'0')}</span><div><strong>{r.nomeDepositante}</strong><small>{r.moduloId}</small></div><div className="attention-metrics"><span>Prod. <b className={`text-${metricStatus(r.producaoPct,prodMeta)}`}>{pct(r.producaoPct)}</b></span><span>Receb. <b className={`text-${metricStatus(r.recebimentoPct,recMeta)}`}>{pct(r.recebimentoPct)}</b></span><span>Inv. <b className={`text-${metricStatus(r.inventario?.totalPct,invMeta)}`}>{pct(r.inventario?.totalPct)}</b></span></div><MetricStatusBadge status={rowStatus} label={rowStatus==='crit'?'Crítico':'Atenção'} className="attention-status"/></div>})}</div>:<EmptyState icon="check_circle" title="Nenhum desvio relevante" description="Os indicadores do escopo atual não apresentam criticidade ou atenção."/>}</Panel>
  </section>
}
