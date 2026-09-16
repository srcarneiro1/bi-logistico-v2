import type { ReactNode } from 'react'
import { Card } from 'primereact/card'

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

export function Panel({children,className=''}:PanelProps){
  return <Card className={`ui-panel nx-prime-panel ${className}`.trim()}>{children}</Card>
}

export function PanelHeader({eyebrow,title,description,trailing}:PanelHeaderProps){
  return <header className="ui-panel-header nx-prime-panel-header">
    <div className="ui-panel-header-copy">
      {eyebrow&&<span className="ui-eyebrow">{eyebrow}</span>}
      <h2>{title}</h2>
      {description&&<p>{description}</p>}
    </div>
    {trailing&&<div className="ui-panel-header-trailing">{trailing}</div>}
  </header>
}
