import type { ReactNode } from 'react'

interface PanelProps {
  children: ReactNode
  className?: string
  as?: 'section' | 'article' | 'div'
}

interface PanelHeaderProps {
  eyebrow?: string
  title: string
  description?: string
  trailing?: ReactNode
}

export function Panel({children,className='',as='section'}:PanelProps){
  const Component=as
  return <Component className={`ui-panel ${className}`.trim()}>{children}</Component>
}

export function PanelHeader({eyebrow,title,description,trailing}:PanelHeaderProps){
  return <header className="ui-panel-header">
    <div className="ui-panel-header-copy">
      {eyebrow&&<span className="ui-eyebrow">{eyebrow}</span>}
      <h2>{title}</h2>
      {description&&<p>{description}</p>}
    </div>
    {trailing&&<div className="ui-panel-header-trailing">{trailing}</div>}
  </header>
}
