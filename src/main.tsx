import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './styles.css'
import './design-system.css'
import './planner-shell.css'
import './ui-foundations.css'
import './detail-primitives.css'
import './home-dashboard.css'
import './app-feedback.css'
import './kpis-dashboard.css'
import './supervisors-discovery.css'
import './depositors-discovery.css'
import './finance-dashboard.css'
import './fca-mobile.css'
import './fca-workspace.css'
import './record-lists.css'
import './sections-feedback.css'
import './accessibility-interactions.css'
import './admin-workspace.css'
import './admin-supervisors.css'
import './mfa.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
