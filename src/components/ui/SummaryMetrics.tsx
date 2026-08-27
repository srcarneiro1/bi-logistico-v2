import type { ReactNode } from 'react'

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

export function SummaryMetrics({items,ariaLabel='Resumo da página',className='',variant='default'}:{items:SummaryMetricItem[];ariaLabel?:string;className?:string;variant?:SummaryMetricsVariant}){
  return <div className={`ui-summary-metrics ui-summary-metrics-${variant} ${className}`.trim()} role="group" aria-label={ariaLabel}>
    {items.map(item=>{
      const tone=item.tone??'neutral'
      const content=<>
        {item.icon&&<span className="ui-summary-metric-icon material-symbols-rounded" aria-hidden="true">{item.icon}</span>}
        <div className="ui-summary-metric-copy"><span>{item.label}</span><strong>{item.value}</strong>{item.detail&&<small>{item.detail}</small>}</div>
      </>
      return item.onClick?
        <button key={item.key} type="button" className={`ui-summary-metric ui-summary-metric-${tone} ${item.active?'is-active':''}`.trim()} aria-pressed={item.active} aria-label={item.ariaLabel} onClick={item.onClick}>{content}</button>:
        <div key={item.key} className={`ui-summary-metric ui-summary-metric-${tone}`}>{content}</div>
    })}
  </div>
}
