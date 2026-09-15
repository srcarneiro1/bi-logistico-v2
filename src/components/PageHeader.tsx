import type { ReactNode } from 'react'
import { Toolbar } from 'primereact/toolbar'
import { usePageFilter } from './PageFilterContext'

export function PageHeader({eyebrow,title,description,actions}:{eyebrow:string;title:string;description:string;actions?:ReactNode}){
  const pageFilter=usePageFilter()
  const start=<div className="nx-page-title-copy"><span className="ui-eyebrow">{eyebrow}</span><h1>{title}</h1><p>{description}</p></div>
  const end=actions?<div className="page-actions nx-modern-actions">{actions}</div>:undefined
  return <>
    <Toolbar start={start} end={end} className="page-header page-header-row nx-prime-page-header"/>
    {pageFilter}
  </>
}
