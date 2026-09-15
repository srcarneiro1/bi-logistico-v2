import type { ReactNode } from 'react'
import { Tag } from 'primereact/tag'

type ChipTone='neutral'|'success'|'warning'|'danger'

export function Chip({children,tone='neutral',className=''}:{children:ReactNode;tone?:ChipTone;className?:string}){
  const severity=tone==='neutral'?'secondary':tone
  return <Tag value={children} severity={severity} rounded className={`ui-chip ui-chip-${tone} nx-prime-chip ${className}`.trim()}/>
}
