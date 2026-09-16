import { InputText } from 'primereact/inputtext'

interface SearchFieldProps{
  value:string
  onChange:(value:string)=>void
  placeholder?:string
  ariaLabel:string
}

export function SearchField({value,onChange,placeholder='Buscar…',ariaLabel}:SearchFieldProps){
  return <span className="p-input-icon-left ui-search-field nx-prime-search">
    <i className="pi pi-search" aria-hidden="true"/>
    <InputText type="search" aria-label={ariaLabel} placeholder={placeholder} value={value} onChange={event=>onChange(event.target.value)}/>
  </span>
}
