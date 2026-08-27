import type { ReactNode } from 'react'

interface SectionHeaderProps{
  eyebrow?:string
  title:string
  description?:string
  trailing?:ReactNode
  titleId?:string
  className?:string
}

export function SectionHeader({eyebrow,title,description,trailing,titleId,className=''}:SectionHeaderProps){
  return <header className={`ui-section-header ${className}`.trim()}>
    <div className="ui-section-header-copy">
      {eyebrow&&<span className="ui-eyebrow">{eyebrow}</span>}
      <h2 id={titleId}>{title}</h2>
      {description&&<p>{description}</p>}
    </div>
    {trailing&&<div className="ui-section-header-trailing">{trailing}</div>}
  </header>
}
