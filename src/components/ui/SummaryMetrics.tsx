import type { ReactNode } from 'react'
import { Button } from 'primereact/button'
import { Card } from 'primereact/card'

export type SummaryMetricTone='neutral'|'success'|'warning'|'danger'|'info'
export type SummaryMetricsVariant='default'|'filters'

export interface SummaryMetricItem {
  key:string
  label:string
  value:ReactNode
  detail?:ReactNode
  tone?:SummaryMetricTone
  icon?:string
  active?:boolean
  onClick?:()=>void
  ariaLabel?:string
}

const metricPrimeIcon:Record<string,string>={
  dataset:'pi pi-database',pending_actions:'pi pi-clock',groups:'pi pi-users',error:'pi pi-exclamation-triangle',manage_accounts:'pi pi-users',verified_user:'pi pi-shield',admin_panel_settings:'pi pi-lock',badge:'pi pi-id-card',inventory_2:'pi pi-box',payments:'pi pi-wallet',local_shipping:'pi pi-truck',receipt_long:'pi pi-receipt',category:'pi pi-tags',calendar_month:'pi pi-calendar',account_balance_wallet:'pi pi-wallet',check_circle:'pi pi-check-circle',warning:'pi pi-exclamation-triangle',trending_up:'pi pi-chart-line'
}

export function SummaryMetrics({items,ariaLabel='Resumo da página',className='',variant='default'}:{items:SummaryMetricItem[];ariaLabel?:string;className?:string;variant?:SummaryMetricsVariant}){
  return <div className={`ui-summary-metrics ui-summary-metrics-${variant} nx-prime-metrics ${className}`.trim()} role="group" aria-label={ariaLabel}>
    {items.map(item=>{
      const tone=item.tone??'neutral'
      const content=<>
        {item.icon&&<span className={`ui-summary-metric-icon ${metricPrimeIcon[item.icon]||'pi pi-chart-bar'}`} aria-hidden="true"/>}
        <div className="ui-summary-metric-copy"><span>{item.label}</span><strong>{item.value}</strong>{item.detail&&<small>{item.detail}</small>}</div>
      </>
      return item.onClick?
        <Button key={item.key} type="button" text className={`ui-summary-metric ui-summary-metric-${tone} nx-prime-metric ${item.active?'is-active':''}`.trim()} aria-pressed={item.active} aria-label={item.ariaLabel} onClick={item.onClick}>{content}</Button>:
        <Card key={item.key} className={`ui-summary-metric ui-summary-metric-${tone} nx-prime-metric`}>{content}</Card>
    })}
  </div>
}
