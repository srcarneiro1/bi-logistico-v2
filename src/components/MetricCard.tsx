import type { MetricStatus } from '../types/dashboard'
import { pp } from '../lib/dashboard'
import { InfoTooltip } from './InfoTooltip'

interface MetricTooltipContent {
  title: string
  description: string
  footer?: string
}

interface MetricCardProps {
  label: string
  value: string
  meta?: string
  status?: MetricStatus
  detail?: string
  delta?: number | null
  gap?: number | null
  tooltip?: MetricTooltipContent
}

export function MetricCard({label,value,meta,status='neutral',detail,delta,gap,tooltip}:MetricCardProps){
  return <article className={`metric-card metric-${status}`}>
    <div className="metric-card-head">
      <span className="metric-card-label">
        <span>{label}</span>
        {tooltip&&<InfoTooltip title={tooltip.title} description={tooltip.description} footer={tooltip.footer}/>}      
      </span>
      <i className={`metric-dot ${status}`} />
    </div>
    <strong>{value}</strong>
    <div className="metric-comparisons">
      <span className={delta==null?'neutral':delta>=0?'positive':'negative'}><small>vs. mês anterior</small><b>{pp(delta)}</b></span>
      <span className={gap==null?'neutral':gap>=0?'positive':'negative'}><small>distância da meta</small><b>{pp(gap)}</b></span>
    </div>
    {(meta||detail)&&<div className="metric-meta"><span>{meta}</span><span>{detail}</span></div>}
  </article>
}
