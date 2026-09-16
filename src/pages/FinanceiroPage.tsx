import { useNavigate } from 'react-router-dom'
import { Card } from 'primereact/card'
import { Column } from 'primereact/column'
import { DataTable } from 'primereact/datatable'
import { PageHeader } from '../components/PageHeader'
import { Chip } from '../components/ui/Chip'
import { ContextNotice } from '../components/ui/ContextNotice'
import { EmptyState } from '../components/ui/Feedback'
import { Panel, PanelHeader } from '../components/ui/Panel'
import { SummaryMetrics } from '../components/ui/SummaryMetrics'
import { money, pct, periodKey, revenueRows, sum } from '../lib/dashboard'
import { openDepositorFrom } from '../lib/navigationContext'
import type { DashboardFilters } from '../types/dashboard'
import type { HubBootstrap, HubReceita } from '../types/hub'

const normalizeRevenueName=(value:string)=>value.toLocaleUpperCase('pt-BR').normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim()
const isOtherOperationalRevenue=(row:HubReceita)=>normalizeRevenueName(row.nomeDepositante)==='OUTRAS RECEITAS OPERACIONAIS'
const hasOperationalScope=(row:HubReceita)=>Boolean(row.supervisorId&&row.supervisorId!=='000000'&&normalizeRevenueName(row.moduloId)!=='NAO APLICAVEL')
const revenueKey=(row:HubReceita)=>`${periodKey(row.periodo)}\u0000${row.codAllStrategy||row.nomeDepositante}\u0000${row.supervisorId}\u0000${row.moduloId}`
const INVALID_CNPJ='00000000000000'

export function FinanceiroPage({hub,filters}:{hub:HubBootstrap;filters:DashboardFilters}){
 const navigate=useNavigate()
 const scopedRows=revenueRows(hub,filters)
 const unscopedPeriodRows=hub.facts.receita.filter(r=>(!filters.periodo||periodKey(r.periodo)===periodKey(filters.periodo))&&!hasOperationalScope(r))
 const rows=Array.from(new Map([...scopedRows,...unscopedPeriodRows].map(r=>[revenueKey(r),r])).values())
 const depositanteRows=rows.filter(r=>!isOtherOperationalRevenue(r)),otherOperationalRows=rows.filter(isOtherOperationalRevenue)
 const planned=sum(rows.map(r=>r.receitaPlanejada)),realized=sum(rows.map(r=>r.receitaRealizada)),balance=realized-planned,attainment=planned?realized/planned:null
 const otherOperationalRealized=sum(otherOperationalRows.map(r=>r.receitaRealizada))
 const canShowConsolidatedExpense=hub.profile.perfil==='ADMIN'&&!filters.supervisorId&&!filters.moduloId
 const expenses=canShowConsolidatedExpense?hub.facts.despesa.filter(r=>!filters.periodo||periodKey(r.periodo)===periodKey(filters.periodo)):[]
 const expenseRows=expenses.map(r=>({...r,rowId:`${r.periodo}-${r.codAllStrategy}`}))
 type ExpenseRow=(typeof expenseRows)[number]
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
 const expensePlanBody=(row:ExpenseRow)=>money(row.despesaPlanejada)
 const expenseRealBody=(row:ExpenseRow)=>money(row.despesaRealizada)
 const expenseVariance=(row:ExpenseRow)=>(row.despesaRealizada??0)-(row.despesaPlanejada??0)
 const expenseVarianceBody=(row:ExpenseRow)=><span className={expenseVariance(row)<0?'text-crit':'text-ok'}>{money(expenseVariance(row))}</span>
 function linkedDepositor(row:HubReceita){return hub.depositantes.find(d=>(row.cnpj&&row.cnpj!==INVALID_CNPJ&&d.cnpj===row.cnpj)||(Boolean(row.codAllStrategy)&&d.codAllStrategy===row.codAllStrategy))??null}
 function openDepositor(cnpj:string){openDepositorFrom(cnpj,{type:'financeiro'});navigate('/depositantes')}
 return <section className="finance-page"><PageHeader eyebrow="RESULTADO" title="Financeiro" description="Receita planejada versus realizada no escopo selecionado. Receitas sem dimensão operacional permanecem no financeiro pelo período, sem serem atribuídas artificialmente ao Supervisor/Módulo selecionado. Outras receitas operacionais entram apenas no consolidado; depositantes sem Supervisor/Módulo permanecem na análise por depositante. Despesas são consolidadas porque a base atual não possui dimensão de supervisor ou módulo."/>
 <Card className="finance-hero nx-entity-card">
   <div className="finance-hero-main"><span>Receita realizada</span><strong>{money(realized)}</strong><small>{depositanteRows.length} depositante(s) no financeiro{otherOperationalRows.length?' + outras receitas operacionais':''}</small></div>
   <div className="finance-hero-attainment"><span>Atingimento</span><strong className={`text-${attainmentStatus}`}>{pct(attainment)}</strong><small>{balance>=0?`${money(balance)} acima do planejado`:`${money(Math.abs(balance))} abaixo do planejado`}</small></div>
 </Card>
 <SummaryMetrics ariaLabel="Resumo financeiro do período" items={support}/>
 {!canShowConsolidatedExpense&&hub.profile.perfil==='ADMIN'&&<ContextNotice title="Despesas não aplicadas ao filtro de Supervisor/Módulo" description="A fDespesa atual possui período e conta, mas não possui Supervisor ou Módulo. Para evitar um resultado incorreto, os cards de despesa e resultado direto ficam ocultos enquanto esses filtros estiverem ativos."/>}
 <Panel as="article" className="finance-depositors-panel"><PanelHeader eyebrow="POR DEPOSITANTE" title="Planejado x realizado" trailing={<Chip>{depositanteRows.length} depositante(s)</Chip>}/><div className="revenue-list">{depositanteRows.map(r=>{const p=r.receitaPlanejada??0,real=r.receitaRealizada??0,at=p?real/p:0;const status=p?(at>=1?'ok':at>=.9?'warn':'crit'):'neutral';const scale=Math.max(p,real,1),plannedWidth=(p/scale)*100,realWidth=(real/scale)*100;const linked=linkedDepositor(r);const content=<><div className="revenue-identity"><strong>{r.nomeDepositante}</strong><span>{hasOperationalScope(r)?r.moduloId:'Sem escopo operacional'}</span></div><div className="revenue-bars"><div><span>Plan.</span><i><b style={{width:`${plannedWidth}%`}}/></i><em>{money(p)}</em></div><div className={`revenue-bar-real revenue-bar-real-${status}`}><span>Real.</span><i><b style={{width:`${realWidth}%`}}/></i><em>{money(real)}</em></div></div><div className="revenue-attainment"><span>Atingimento</span><strong className={`text-${status}`}>{p?pct(at):'s/ plano'}</strong></div></>;return linked?<button type="button" className="revenue-row nx-depositor-record" key={revenueKey(r)} aria-label={`Abrir visão 360º de ${linked.nome}`} onClick={()=>openDepositor(linked.cnpj)}>{content}</button>:<div className="revenue-row" key={revenueKey(r)}>{content}</div>})}{!depositanteRows.length&&<EmptyState icon="payments" title="Sem receita por depositante no escopo selecionado" description="Ajuste os filtros globais para consultar outro período, supervisor ou módulo."/>}</div></Panel>
 {canShowConsolidatedExpense&&expenses.length>0&&<Panel as="article" className="finance-expenses-panel"><PanelHeader eyebrow="DESPESAS CONSOLIDADAS" title="Composição do período" trailing={<Chip>sem rateio por supervisor</Chip>}/>
   <div className="finance-expenses-prime-table" aria-label="Despesas consolidadas do período">
     <DataTable value={expenseRows} dataKey="rowId" size="small" rowHover responsiveLayout="scroll" className="nx-prime-table" tableStyle={{minWidth:'620px'}}>
       <Column field="codAllStrategy" header="Conta"/>
       <Column field="despesaPlanejada" header="Planejado" body={expensePlanBody}/>
       <Column field="despesaRealizada" header="Realizado" body={expenseRealBody}/>
       <Column header="Variação" body={expenseVarianceBody}/>
     </DataTable>
   </div>
   <div className="finance-expenses-mobile-records" role="list" aria-label="Despesas consolidadas do período">
     {expenseRows.map(row=><article className="finance-expense-mobile-record" key={row.rowId} role="listitem"><header><strong>{row.codAllStrategy}</strong><span className={expenseVariance(row)<0?'text-crit':'text-ok'}>{money(expenseVariance(row))}</span></header><div><span>Planejado<strong>{money(row.despesaPlanejada)}</strong></span><span>Realizado<strong>{money(row.despesaRealizada)}</strong></span></div></article>)}
   </div>
 </Panel>}
 </section>
}
