import { Card } from 'primereact/card'
import type { MetricStatus } from '../types/dashboard'
import { pp } from '../lib/dashboard'

type MetricCardVariant='primary'|'supporting'

const statusTone:Record<MetricStatus,'neutral'|'success'|'warning'|'danger'>={neutral:'neutral',ok:'success',warn:'warning',crit:'danger'}
const ppTone=(value:number)=>value>0?'positive':value<0?'negative':'neutral'

export function MetricCard({label,value,meta,status='neutral',detail,delta,gap,variant='primary'}:{label:string;value:string;meta?:string;status?:MetricStatus;detail?:string;delta?:number|null;gap?:number|null;variant?:MetricCardVariant}){
  const tone=statusTone[status]
  const primaryDetail=[meta,detail].filter(Boolean).join(' · ')
  return <Card data-status={status} className={`dashboard-metric dashboard-metric-${tone} nx-dashboard-metric-card metric-card metric-card-${variant}`}>
    <span>{label}</span>
    <strong className="metric-card-value">{value}</strong>
    {primaryDetail&&<small>{primaryDetail}</small>}
    {(delta!=null||gap!=null)&&<small className="metric-card-comparison">
      {delta!=null&&<span className={`metric-card-pp metric-card-pp-${ppTone(delta)}`}>Mês {pp(delta)}</span>}
      {delta!=null&&gap!=null&&<span className="metric-card-pp-separator" aria-hidden="true">·</span>}
      {gap!=null&&<span className={`metric-card-pp metric-card-pp-${ppTone(gap)}`}>Meta {pp(gap)}</span>}
    </small>}
  </Card>
}
