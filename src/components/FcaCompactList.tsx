import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { StatusBadge } from './ui/Badge'
import { deriveFcaDisplayStatus } from '../lib/fca'
import type { FcaWithActions } from '../types/fca'

interface FcaCompactListProps {
  items: FcaWithActions[]
  title: (fca: FcaWithActions) => ReactNode
  meta: (fca: FcaWithActions) => ReactNode
  onOpen?: (fca: FcaWithActions) => void
}

export function FcaCompactList({ items, title, meta, onOpen }: FcaCompactListProps) {
  return <div className="fca-compact-list">
    {items.map(fca => <Link key={fca.id} to={`/fca/${fca.id}`} onClick={() => onOpen?.(fca)}>
      <div className="fca-compact-copy">
        <strong>{title(fca)}</strong>
        <span className="fca-compact-meta">{meta(fca)}</span>
      </div>
      <StatusBadge status={deriveFcaDisplayStatus(fca)} />
    </Link>)}
  </div>
}
