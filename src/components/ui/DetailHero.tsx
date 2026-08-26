import type { ReactNode } from 'react'

export interface DetailHeroMetaItem{
  label:string
  value:ReactNode
}

export function DetailHero({eyebrow,title,description,leading,status,meta=[],actions,className=''}:{eyebrow:string;title:ReactNode;description?:ReactNode;leading?:ReactNode;status?:ReactNode;meta?:DetailHeroMetaItem[];actions?:ReactNode;className?:string}){
  return <article className={`ui-detail-hero ${className}`.trim()}>
    <div className="ui-detail-hero-primary">
      {leading&&<div className="ui-detail-hero-leading">{leading}</div>}
      <div className="ui-detail-hero-copy">
        <span className="ui-detail-hero-eyebrow">{eyebrow}</span>
        <div className="ui-detail-hero-title-row"><h2>{title}</h2>{status}</div>
        {description&&<p>{description}</p>}
      </div>
      {actions&&<div className="ui-detail-hero-actions">{actions}</div>}
    </div>
    {meta.length>0&&<dl className="ui-detail-hero-meta">{meta.map(item=><div key={item.label}><dt>{item.label}</dt><dd>{item.value}</dd></div>)}</dl>}
  </article>
}

export type DetailMetricTone='neutral'|'success'|'warning'|'danger'

export interface DetailMetricItem{
  key:string
  label:string
  value:ReactNode
  detail?:ReactNode
  tone?:DetailMetricTone
}

export function DetailMetrics({items,className=''}:{items:DetailMetricItem[];className?:string}){
  return <div className={`ui-detail-metrics ${className}`.trim()}>{items.map(item=><div key={item.key} className={`ui-detail-metric ui-detail-metric-${item.tone??'neutral'}`}><span>{item.label}</span><strong>{item.value}</strong>{item.detail&&<small>{item.detail}</small>}</div>)}</div>
}
