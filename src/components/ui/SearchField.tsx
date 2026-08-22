interface SearchFieldProps{
  value:string
  onChange:(value:string)=>void
  placeholder?:string
  ariaLabel:string
}

export function SearchField({value,onChange,placeholder='Buscar…',ariaLabel}:SearchFieldProps){
  return <label className="ui-search-field">
    <span className="material-symbols-rounded" aria-hidden="true">search</span>
    <span className="sr-only">{ariaLabel}</span>
    <input type="search" aria-label={ariaLabel} placeholder={placeholder} value={value} onChange={event=>onChange(event.target.value)}/>
  </label>
}
