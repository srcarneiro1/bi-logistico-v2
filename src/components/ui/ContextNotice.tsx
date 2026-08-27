interface ContextNoticeProps {
  icon?: string
  title: string
  description: string
  className?: string
}

export function ContextNotice({icon='info',title,description,className=''}:ContextNoticeProps){
  return <div className={`ui-context-notice ${className}`.trim()} role="note">
    <span className="material-symbols-rounded" aria-hidden="true">{icon}</span>
    <div><strong>{title}</strong><p>{description}</p></div>
  </div>
}
