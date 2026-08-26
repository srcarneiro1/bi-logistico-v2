import type { ReactNode } from 'react'

interface PageToolbarProps {
  search?: ReactNode
  filters?: ReactNode
  actions?: ReactNode
  ariaLabel?: string
  embedded?: boolean
  className?: string
}

export function PageToolbar({
  search,
  filters,
  actions,
  ariaLabel='Ferramentas da página',
  embedded=false,
  className='',
}:PageToolbarProps){
  return <div className={`ui-page-toolbar ${embedded?'ui-page-toolbar-embedded':''} ${className}`.trim()} role="region" aria-label={ariaLabel}>
    <div className="ui-page-toolbar-main">
      {search&&<div className="ui-page-toolbar-search">{search}</div>}
      {filters&&<div className="ui-page-toolbar-filters">{filters}</div>}
    </div>
    {actions&&<div className="ui-page-toolbar-actions">{actions}</div>}
  </div>
}
