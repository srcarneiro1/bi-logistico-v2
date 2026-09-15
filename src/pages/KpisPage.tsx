import { Column } from 'primereact/column'
import { DataTable } from 'primereact/datatable'
import { MetricCard } from '../components/MetricCard'
import { PageHeader } from '../components/PageHeader'
import { SimpleLineChart } from '../components/SimpleLineChart'
import { MetricStatusBadge } from '../components/ui/Badge'
import { Chip } from '../components/ui/Chip'
import { EmptyState } from '../components/ui/Feedback'
import { Panel, PanelHeader } from '../components/ui/Panel'
import { SectionHeader } from '../components/ui/SectionHeader'
import { indicatorMeta, inventoryAggregate, kpiComparison, mainKpis, metricStatus, operationalRows, pct, periodKey, periodLabel, trendGlobal, trendInventory, trendScopedInventory, trendScopedOperational } from '../lib/dashboard'
import type { DashboardFilters, MetricStatus } from '../types/dashboard'
import type { HubBootstrap } from '../types/hub'

const statusLabel:Record<MetricStatus,string>={ok:'Dentro da meta',warn:'Atenção',crit:'Crítico',neutral:'Sem dados no período'}
const rank:Record<MetricStatus,number>={crit:3,warn:2,neutral:1,ok:0}
function historyWindow<T extends {periodo:string}>(series:T[],periodo:string,max=18){const key=periodKey(periodo);return series.filter(x=>!key||periodKey(x.periodo)<=key).slice(-max)}

export function KpisPage({hub,filters}:{hub:HubBootstrap;filters:DashboardFilters}){
 const kpis=mainKpis(hub,filters),inv=inventoryAggregate(hub,filters),ops=operationalRows(hub,filters)
 const isGlobal=hub.profile.perfil==='ADMIN'&&!filters.supervisorId&&!filters.moduloId
 const prod=historyWindow(isGlobal?trendGlobal(hub.facts.kpiGeral,'Lead Time Produção'):trendScopedOperational(hub.facts.kpiOperacional,'producaoPct',filters),filters.periodo)
 const rec=historyWindow(isGlobal?trendGlobal(hub.facts.kpiGeral,'Lead Time Recebimento'):trendScopedOperational(hub.facts.kpiOperacional,'recebimentoPct',filters),filters.periodo)
 const inventorySeriesConfig=[
  {label:'Pontuação Total',official:'Pontuação Total',field:'totalPct' as const,tone:'green' as const},
  {label:'Prazo',official:'Prazo',field:'prazoPct' as const,tone:'red' as const},
  {label:'Endereço',official:'Endereço',field:'enderecoPct' as const,tone:'gray' as const},
  {label:'Unidade',official:'Unidade',field:'unidadePct' as const,tone:'blue' as const},
  {label:'SKU',official:'SKU',field:'skuPct' as const,tone:'yellow' as const},
 ]
 const invSeries=inventorySeriesConfig.map(item=>({label:item.label,values:historyWindow(isGlobal?trendInventory(hub.facts.kpiInventario,item.official):trendScopedInventory(hub.facts.kpiInventarioDepositante,filters,item.field),filters.periodo),tone:item.tone}))
 const hasInventoryHistory=invSeries.some(series=>series.values.some(point=>point.value!=null))
 const metaProd=indicatorMeta(hub,'Lead Time Produção'),metaRec=indicatorMeta(hub,'Lead Time Recebimento'),metaInv=indicatorMeta(hub,'Inventário')
 const rows=ops.map(r=>{const statuses=[metricStatus(r.producaoPct,metaProd),metricStatus(r.recebimentoPct,metaRec),metricStatus(r.inventario?.totalPct,metaInv)];const worst=statuses.reduce((a,b)=>rank[b]>rank[a]?b:a,'ok' as MetricStatus);return {...r,rowId:[r.cnpj,r.supervisorId,r.moduloId].join(':'),statusProd:statuses[0],statusRec:statuses[1],statusInv:statuses[2],status:worst}}).sort((a,b)=>rank[b.status]-rank[a.status])
 type KpiRow=(typeof rows)[number]
 const inventoryScoreMeta=indicatorMeta(hub,'Pontuação Total')??metaInv
 const periodText=filters.periodo?periodLabel(filters.periodo):'último período'
 const metricBody=(field:'producaoPct'|'recebimentoPct',statusField:'statusProd'|'statusRec')=>(row:KpiRow)=><span className={`metric-cell metric-cell-${row[statusField]}`}>{pct(row[field])}</span>
 const inventoryBody=(row:KpiRow)=><span className={`metric-cell metric-cell-${row.statusInv}`}>{pct(row.inventario?.totalPct)}</span>
 const statusBody=(row:KpiRow)=><MetricStatusBadge status={row.status} label={statusLabel[row.status]}/>
 return <section className="kpis-page">
  <PageHeader eyebrow="INDICADORES" title="KPIs operacionais" description="Metas, criticidade e evolução dos indicadores no escopo selecionado."/>

  <section className="kpis-overview" aria-labelledby="kpis-overview-title">
   <SectionHeader eyebrow="VISÃO DO PERÍODO" title="Indicadores consolidados" titleId="kpis-overview-title" trailing={<Chip>{periodText}</Chip>}/>
   <div className="kpis-compact-grid">{kpis.slice(0,5).map(k=>{const c=kpiComparison(hub,filters,k.label,k.value);return <MetricCard key={k.label} variant="supporting" label={k.label} value={pct(k.value)} status={metricStatus(k.value,k.meta)} meta={k.meta?.metaPct!=null?`Meta ${pct(k.meta.metaPct)}`:'Sem meta'} delta={c.delta} gap={c.gap}/>})}</div>
  </section>

  <div className="kpis-analysis-grid">
   <Panel as="article" className="kpis-leadtime-panel"><PanelHeader eyebrow="HISTÓRICO ATÉ O PERÍODO" title="Evolução dos lead times" trailing={<Chip>até {periodText}</Chip>}/><div className="panel-body"><SimpleLineChart series={[{label:'Produção',values:prod,tone:'red'},{label:'Recebimento',values:rec,tone:'gray'}]}/></div></Panel>
   <Panel as="article" className="kpis-inventory-panel"><PanelHeader eyebrow="INVENTÁRIO" title="Composição do indicador" trailing={<Chip>{inv.source==='official'?'Consolidado oficial':'Média do escopo'}</Chip>}/><div className="inventory-score"><span>Pontuação do período</span><strong className={`text-${metricStatus(inv.total,inventoryScoreMeta)}`}>{pct(inv.total)}</strong><small>{inventoryScoreMeta?.metaPct!=null?`Meta ${pct(inventoryScoreMeta.metaPct)}`:'Média consolidada'}</small></div><div className="inventory-support-grid">{[['Prazo',inv.prazo],['Endereço',inv.endereco],['Unidade',inv.unidade],['SKU',inv.sku]].map(([label,value])=>{const v=value as number|null,labelText=String(label),meta=indicatorMeta(hub,labelText);return <div key={labelText}><span>{labelText}</span><strong className={`text-${metricStatus(v,meta)}`}>{pct(v)}</strong><small>{meta?.metaPct!=null?`Meta ${pct(meta.metaPct)}`:'Média do período'}</small></div>})}</div></Panel>
  </div>

  {hasInventoryHistory&&<Panel as="article" className="kpis-history-panel"><PanelHeader eyebrow="HISTÓRICO ATÉ O PERÍODO" title="Evolução do inventário" trailing={<Chip>{isGlobal?'Consolidado oficial':'Média do escopo'}</Chip>}/><div className="panel-body"><SimpleLineChart series={invSeries}/></div></Panel>}

  <Panel as="article" className="kpis-table-panel">
   <PanelHeader eyebrow="BASE OPERACIONAL" title="Performance por depositante" trailing={<Chip>{rows.length} depositantes</Chip>}/>
   <div className="kpis-prime-table" aria-label="Performance por depositante">
    <DataTable value={rows} dataKey="rowId" size="small" rowHover emptyMessage="Sem dados para o escopo atual." tableStyle={{minWidth:'720px'}}>
     <Column field="nomeDepositante" header="Depositante" sortable body={(row:KpiRow)=><strong>{row.nomeDepositante}</strong>}/>
     <Column field="moduloId" header="Módulo" sortable body={(row:KpiRow)=><Chip>{row.moduloId}</Chip>}/>
     <Column field="producaoPct" header="Produção" sortable body={metricBody('producaoPct','statusProd')}/>
     <Column field="recebimentoPct" header="Recebimento" sortable body={metricBody('recebimentoPct','statusRec')}/>
     <Column field="inventario.totalPct" header="Inventário" sortable body={inventoryBody}/>
     <Column header="Status" body={statusBody}/>
    </DataTable>
   </div>
   <div className="kpis-mobile-records" role="list" aria-label="Performance por depositante">
    {rows.map(row=><article key={row.rowId} className="kpis-mobile-record" role="listitem">
     <header><div><strong>{row.nomeDepositante}</strong><Chip>{row.moduloId}</Chip></div>{statusBody(row)}</header>
     <div className="kpis-mobile-metrics">
      <div><span>Produção</span>{metricBody('producaoPct','statusProd')(row)}</div>
      <div><span>Recebimento</span>{metricBody('recebimentoPct','statusRec')(row)}</div>
      <div><span>Inventário</span>{inventoryBody(row)}</div>
     </div>
    </article>)}
    {!rows.length&&<EmptyState icon="table_rows" title="Sem dados no escopo" description="Não há depositantes com indicadores para os filtros atuais."/>}
   </div>
  </Panel>
 </section>
}
