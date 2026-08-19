import type { MetricStatus } from '../types/dashboard'

export function MetricCard({label,value,meta,status='neutral',detail}:{label:string;value:string;meta?:string;status?:MetricStatus;detail?:string}){
  return <article className={`metric-card metric-${status}`}>
    <div className="metric-card-head"><span>{label}</span><i className={`metric-dot ${status}`} /></div>
    <strong>{value}</strong>
    {(meta||detail)&&<div className="metric-meta"><span>{meta}</span><span>{detail}</span></div>}
  </article>
}
