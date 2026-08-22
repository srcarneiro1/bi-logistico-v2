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

export function StatusBadge({status}:{status:string}){
  const normalized=status.toUpperCase()
  const tone:BadgeTone=normalized==='CONCLUIDO'?'success':normalized==='EM_ANDAMENTO'?'warning':normalized==='VENCIDO'?'danger':'neutral'
  return <Badge tone={tone}>{normalized.replace('_',' ')}</Badge>
}
