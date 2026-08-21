import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './styles.css'
import './ux-polish.css'
import './functional-polish.css'
import './audit-polish.css'
import './design-system.css'
import './planner-shell.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
