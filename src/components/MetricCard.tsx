import { Card } from 'primereact/card'
import type { MetricStatus } from '../types/dashboard'
import { pp } from '../lib/dashboard'

type MetricCardVariant='primary'|'supporting'

export function MetricCard({label,value,meta,status='neutral',detail,delta,gap,variant='primary'}:{label:string;value:string;meta?:string;status?:MetricStatus;detail?:string;delta?:number|null;gap?:number|null;variant?:MetricCardVariant}){
  return <Card className={`metric-card metric-card-${variant}`}>
    <div className="metric-card-head"><span>{label}</span><i className={`metric-dot ${status}`} aria-hidden="true"/></div>
    <strong className="metric-card-value">{value}</strong>
    <div className="metric-comparisons">
      <span className={delta==null?'neutral':delta>=0?'positive':'negative'}><small>vs. mês anterior</small><b>{pp(delta)}</b></span>
      <span className={gap==null?'neutral':gap>=0?'positive':'negative'}><small>distância da meta</small><b>{pp(gap)}</b></span>
    </div>
    {(meta||detail)&&<div className="metric-meta"><span>{meta}</span><span>{detail}</span></div>}
  </Card>
}
