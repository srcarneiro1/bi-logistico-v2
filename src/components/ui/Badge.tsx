import type { ReactNode } from 'react'

type BadgeTone='neutral'|'success'|'warning'|'danger'
type MetricBadgeStatus='ok'|'warn'|'crit'|'neutral'

interface BadgeProps{
  children:ReactNode
  tone?:BadgeTone
  className?:string
}

const workflowLabels:Record<string,string>={
  ABERTO:'Aberto',
  EM_ANDAMENTO:'Em andamento',
  CONCLUIDO:'Concluído',
  CANCELADO:'Cancelado',
  VENCIDO:'Vencido',
}

export function Badge({children,tone='neutral',className=''}:BadgeProps){
  return <span className={`ui-badge ui-badge-${tone} ${className}`.trim()}>{children}</span>
}

export function StatusBadge({status,className=''}:{status:string;className?:string}){
  const normalized=status.toUpperCase()
  const tone:BadgeTone=normalized==='CONCLUIDO'?'success':normalized==='EM_ANDAMENTO'?'warning':normalized==='VENCIDO'?'danger':'neutral'
  return <Badge tone={tone} className={`ui-status-badge ${className}`.trim()}>{workflowLabels[normalized]??normalized.replaceAll('_',' ')}</Badge>
}

export function MetricStatusBadge({status,label,className=''}:{status:MetricBadgeStatus;label:string;className?:string}){
  const tone:BadgeTone=status==='ok'?'success':status==='warn'?'warning':status==='crit'?'danger':'neutral'
  return <Badge tone={tone} className={`ui-status-badge ${className}`.trim()}>{label}</Badge>
}
