import type { ReactNode } from 'react'

type BadgeTone='neutral'|'success'|'warning'|'danger'

interface BadgeProps{
  children:ReactNode
  tone?:BadgeTone
  className?:string
}

export function Badge({children,tone='neutral',className=''}:BadgeProps){
  return <span className={`ui-badge ui-badge-${tone} ${className}`.trim()}>{children}</span>
}

export function StatusBadge({status,className=''}:{status:string;className?:string}){
  const normalized=status.toUpperCase()
  const tone:BadgeTone=normalized==='CONCLUIDO'?'success':normalized==='EM_ANDAMENTO'?'warning':normalized==='VENCIDO'?'danger':'neutral'
  return <Badge tone={tone} className={`ui-status-badge ${className}`.trim()}>{normalized.replaceAll('_',' ')}</Badge>
}

export function DeadlineBadge({date,status,className=''}:{date?:string|null;status?:string|null;className?:string}){
  const normalized=(status??'').toUpperCase()
  const isClosed=normalized==='CONCLUIDO'||normalized==='CANCELADO'
  if(!date)return <Badge className={`ui-deadline-badge ${className}`.trim()}><span className="material-symbols-rounded" aria-hidden="true">event_busy</span>Sem prazo</Badge>

  const today=new Intl.DateTimeFormat('en-CA',{timeZone:'America/Sao_Paulo'}).format(new Date())
  const formatted=new Date(`${date}T12:00:00`).toLocaleDateString('pt-BR')
  const overdue=!isClosed&&date<today
  const dueToday=!isClosed&&date===today
  const tone:BadgeTone=overdue?'danger':dueToday?'warning':'neutral'
  const label=overdue?`Venceu ${formatted}`:dueToday?'Vence hoje':`Prazo ${formatted}`

  return <Badge tone={tone} className={`ui-deadline-badge ${className}`.trim()}><span className="material-symbols-rounded" aria-hidden="true">event</span>{label}</Badge>
}
