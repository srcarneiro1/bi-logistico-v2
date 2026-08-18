import type { ReactNode } from 'react'
import { NavLink } from 'react-router-dom'
import type { HubProfile } from '../types/hub'

interface Props {
  profile: HubProfile
  onSignOut: () => Promise<void>
  children: ReactNode
}

const items = [
  { to: '/', label: 'Visão geral' },
  { to: '/fca', label: 'FCA' },
]

export function AppShell({ profile, onSignOut, children }: Props) {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark">U</span>
          <div>
            <strong>BI Logístico</strong>
            <span>V2</span>
          </div>
        </div>
        <nav>
          {items.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.to === '/'}>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="user-panel">
          <div>
            <strong>{profile.nome}</strong>
            <span>{profile.perfil}</span>
          </div>
          <button className="button button-ghost" onClick={() => void onSignOut()}>Sair</button>
        </div>
      </aside>
      <main className="content">{children}</main>
    </div>
  )
}
