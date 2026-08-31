import { PageHeader } from '../components/PageHeader'
import { Chip } from '../components/ui/Chip'
import { ContextNotice } from '../components/ui/ContextNotice'
import { EmptyState } from '../components/ui/Feedback'
import { Panel, PanelHeader } from '../components/ui/Panel'
import { SummaryMetrics } from '../components/ui/SummaryMetrics'
import { money, pct, periodKey, revenueRows, sum } from '../lib/dashboard'
import type { DashboardFilters } from '../types/dashboard'
import type { HubBootstrap, HubReceita } from '../types/hub'

const normalizeRevenueName=(value:string)=>value.toLocaleUpperCase('pt-BR').normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim()
const isOtherOperationalRevenue=(row:HubReceita)=>normalizeRevenueName(row.nomeDepositante)==='OUTRAS RECEITAS OPERACIONAIS'

export function FinanceiroPage({hub,filters}:{hub:HubBootstrap;filters:DashboardFilters}){
 const rows=revenueRows(hub,filters),depositanteRows=rows.filter(r=>!isOtherOperationalRevenue(r)),otherOperationalRows=rows.filter(isOtherOperationalRevenue)
 const planned=sum(rows.map(r=>r.receitaPlanejada)),realized=sum(rows.map(r=>r.receitaRealizada)),balance=realized-planned,attainment=planned?realized/planned:null
 const otherOperationalRealized=sum(otherOperationalRows.map(r=>r.receitaRealizada))
 const canShowConsolidatedExpense=hub.profile.perfil==='ADMIN'&&!filters.supervisorId&&!filters.moduloId
 const expenses=canShowConsolidatedExpense?hub.facts.despesa.filter(r=>!filters.periodo||periodKey(r.periodo)===periodKey(filters.periodo)):[]
 const expPlan=sum(expenses.map(r=>r.despesaPlanejada)),expReal=sum(expenses.map(r=>r.despesaRealizada)),result=realized+expReal
 const attainmentStatus=attainment!=null&&attainment>=1?'ok':attainment!=null&&attainment<.9?'crit':'warn'
 const support=[
   {key:'planned',label:'Receita planejada',value:money(planned),detail:'base de comparação do período',icon:'target'},
   {key:'balance',label:'Saldo versus plano',value:money(balance),detail:balance>=0?'resultado acima do plano':'resultado abaixo do plano',icon:'difference',tone:balance<0?'danger' as const:'success' as const},
   ...(otherOperationalRows.length?[{key:'other-revenue',label:'Outras receitas operacionais',value:money(otherOperationalRealized),detail:'receita sem vínculo com depositante',icon:'add_card'}]:[]),
   ...(canShowConsolidatedExpense?[
     {key:'expense',label:'Despesa realizada',value:money(expReal),detail:`Planejado ${money(expPlan)}`,icon:'payments'},
     {key:'result',label:'Resultado direto',value:money(result),detail:'receita realizada + despesa realizada',icon:'account_balance_wallet',tone:result<0?'danger' as const:'success' as const},
   ]:[]),
 ]
 return <section className="finance-page"><PageHeader eyebrow="RESULTADO" title="Financeiro" description="Receita planejada versus realizada no escopo selecionado. Depositantes sem Supervisor/Módulo permanecem na análise financeira por depositante; outras receitas operacionais entram apenas no consolidado. Despesas são consolidadas porque a base atual não possui dimensão de supervisor ou módulo."/>
 <div className="finance-hero">
   <div className="finance-hero-main"><span>Receita realizada</span><strong>{money(realized)}</strong><small>{depositanteRows.length} depositante(s) no financeiro{otherOperationalRows.length?' + outras receitas operacionais':''}</small></div>
   <div className="finance-hero-attainment"><span>Atingimento</span><strong className={`text-${attainmentStatus}`}>{pct(attainment)}</strong><small>{balance>=0?`${money(balance)} acima do planejado`:`${money(Math.abs(balance))} abaixo do planejado`}</small></div>
 </div>
 <SummaryMetrics ariaLabel="Resumo financeiro do período" items={support}/>
 {!canShowConsolidatedExpense&&hub.profile.perfil==='ADMIN'&&<ContextNotice title="Despesas não aplicadas ao filtro de Supervisor/Módulo" description="A fDespesa atual possui período e conta, mas não possui Supervisor ou Módulo. Para evitar um resultado incorreto, os cards de despesa e resultado direto ficam ocultos enquanto esses filtros estiverem ativos."/>}
 <Panel as="article" className="finance-depositors-panel"><PanelHeader eyebrow="POR DEPOSITANTE" title="Planejado x realizado" trailing={<Chip>{depositanteRows.length} depositante(s)</Chip>}/><div className="revenue-list">{depositanteRows.map(r=>{const p=r.receitaPlanejada??0,real=r.receitaRealizada??0,at=p?real/p:0;const status=p?(at>=1?'ok':at>=.9?'warn':'crit'):'neutral';const scale=Math.max(p,real,1),plannedWidth=(p/scale)*100,realWidth=(real/scale)*100;const hasOperationalScope=r.supervisorId&&r.supervisorId!=='000000'&&normalizeRevenueName(r.moduloId)!=='NAO APLICAVEL';return <div className="revenue-row" key={`${r.periodo}-${r.codAllStrategy||r.nomeDepositante}`}><div className="revenue-identity"><strong>{r.nomeDepositante}</strong><span>{hasOperationalScope?r.moduloId:'Sem escopo operacional'}</span></div><div className="revenue-bars"><div><span>Plan.</span><i><b style={{width:`${plannedWidth}%`}}/></i><em>{money(p)}</em></div><div className={`revenue-bar-real revenue-bar-real-${status}`}><span>Real.</span><i><b style={{width:`${realWidth}%`}}/></i><em>{money(real)}</em></div></div><div className="revenue-attainment"><span>Atingimento</span><strong className={`text-${status}`}>{p?pct(at):'s/ plano'}</strong></div></div>})}{!depositanteRows.length&&<EmptyState icon="payments" title="Sem receita por depositante no escopo selecionado" description="Ajuste os filtros globais para consultar outro período, supervisor ou módulo."/>}</div></Panel>
 {canShowConsolidatedExpense&&expenses.length>0&&<Panel as="article" className="finance-expenses-panel"><PanelHeader eyebrow="DESPESAS CONSOLIDADAS" title="Composição do período" trailing={<Chip>sem rateio por supervisor</Chip>}/><div className="table-wrap embedded"><table className="responsive-data-table"><thead><tr><th scope="col">Conta</th><th scope="col">Planejado</th><th scope="col">Realizado</th><th scope="col">Variação</th></tr></thead><tbody>{expenses.map(r=><tr key={`${r.periodo}-${r.codAllStrategy}`}><td data-label="Conta" data-primary="true"><strong>{r.codAllStrategy}</strong></td><td data-label="Planejado">{money(r.despesaPlanejada)}</td><td data-label="Realizado">{money(r.despesaRealizada)}</td><td data-label="Variação" className={(r.despesaRealizada??0)<(r.despesaPlanejada??0)?'text-crit':'text-ok'}>{money((r.despesaRealizada??0)-(r.despesaPlanejada??0))}</td></tr>)}</tbody></table></div></Panel>}
 </section>
}
