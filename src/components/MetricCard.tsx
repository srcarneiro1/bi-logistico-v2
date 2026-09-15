import { Card } from 'primereact/card'
import type { MetricStatus } from '../types/dashboard'
import { pp } from '../lib/dashboard'

type MetricCardVariant='primary'|'supporting'

export function MetricCard({label,value,meta,status='neutral',detail,delta,gap,variant='primary'}:{label:string;value:string;meta?:string;status?:MetricStatus;detail?:string;delta?:number|null;gap?:number|null;variant?:MetricCardVariant}){
  const primaryDetail=[meta,detail].filter(Boolean).join(' · ')
  const comparison=[delta==null?null:`Mês ${pp(delta)}`,gap==null?null:`Meta ${pp(gap)}`].filter(Boolean).join(' · ')
  return <Card data-status={status} className={`dashboard-metric dashboard-metric-neutral nx-dashboard-metric-card metric-card metric-card-${variant}`}>
    <span>{label}</span>
    <strong className="metric-card-value">{value}</strong>
    {primaryDetail&&<small>{primaryDetail}</small>}
    {comparison&&<small className="metric-card-comparison">{comparison}</small>}
  </Card>
}
