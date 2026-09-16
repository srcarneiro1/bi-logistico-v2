interface ContextNoticeProps {
  icon?: string
  title: string
  description: string
  className?: string
}

const noticePrimeIcon:Record<string,string>={
  info:'pi pi-info-circle',
  event_repeat:'pi pi-sync',
  history:'pi pi-history',
  image:'pi pi-image',
  warning:'pi pi-exclamation-triangle',
  lock:'pi pi-lock',
}

export function ContextNotice({icon='info',title,description,className=''}:ContextNoticeProps){
  return <div className={`ui-context-notice ${className}`.trim()} role="note">
    <i className={noticePrimeIcon[icon]??'pi pi-info-circle'} aria-hidden="true"/>
    <div><strong>{title}</strong><p>{description}</p></div>
  </div>
}
