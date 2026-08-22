import type { ReactNode } from 'react'

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

export function EmptyState({title,description,icon='inbox',action,tone='neutral'}:EmptyStateProps){
  return <div className={`ui-empty-state ui-empty-state-${tone}`} role={tone==='error'?'alert':undefined}>
    <span className="material-symbols-rounded" aria-hidden="true">{icon}</span>
    <div><strong>{title}</strong>{description&&<p>{description}</p>}</div>
    {action&&<div className="ui-empty-state-action">{action}</div>}
  </div>
}

export function Skeleton({lines=3,className=''}:SkeletonProps){
  return <div className={`ui-skeleton ${className}`.trim()} aria-hidden="true">{Array.from({length:lines},(_,index)=><span key={index}/>)}</div>
}
