import type { ReactNode } from 'react'

type ChipTone='neutral'|'success'|'warning'|'danger'

export function Chip({children,tone='neutral',className=''}:{children:ReactNode;tone?:ChipTone;className?:string}){
  return <span className={`ui-chip ui-chip-${tone} ${className}`.trim()}>{children}</span>
}
