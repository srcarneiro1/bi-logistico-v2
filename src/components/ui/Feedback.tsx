import type { ReactNode } from 'react'
import { Skeleton as PrimeSkeleton } from 'primereact/skeleton'

type EmptyStateTone='neutral'|'error'

interface EmptyStateProps{
  title:string
  description?:string
  icon?:string
  action?:ReactNode
  tone?:EmptyStateTone
}

interface SkeletonProps{
  lines?:number
  className?:string
}

const emptyPrimeIcon:Record<string,string>={
  inbox:'pi pi-inbox',error:'pi pi-exclamation-circle',lock:'pi pi-lock',check_circle:'pi pi-check-circle',task_alt:'pi pi-check-square',table_rows:'pi pi-table',link_off:'pi pi-link',search:'pi pi-search',info:'pi pi-info-circle',warning:'pi pi-exclamation-triangle',group_off:'pi pi-users',history:'pi pi-history',event_busy:'pi pi-calendar-times',fact_check:'pi pi-file-check'
}

export function EmptyState({title,description,icon='inbox',action,tone='neutral'}:EmptyStateProps){
  const iconClass=tone==='error'?'pi pi-exclamation-circle':emptyPrimeIcon[icon]??'pi pi-inbox'
  return <div className={`ui-empty-state ui-empty-state-${tone} nx-prime-empty`} role={tone==='error'?'alert':undefined}>
    <span className="nx-prime-empty-icon"><i className={iconClass} aria-hidden="true"/></span>
    <div><strong>{title}</strong>{description&&<p>{description}</p>}</div>
    {action&&<div className="ui-empty-state-action">{action}</div>}
  </div>
}

export function Skeleton({lines=3,className=''}:SkeletonProps){
  return <div className={`ui-skeleton nx-prime-skeleton ${className}`.trim()} aria-hidden="true">{Array.from({length:lines},(_,index)=><PrimeSkeleton key={index} height={index===0?'1.25rem':'.9rem'} width={index%3===0?'92%':index%2===0?'76%':'84%'}/>)}</div>
}
