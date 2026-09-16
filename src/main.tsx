import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { PrimeReactProvider } from 'primereact/api'
import 'primereact/resources/themes/lara-light-indigo/theme.css'
import 'primereact/resources/primereact.min.css'
import 'primeicons/primeicons.css'
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
import './fca-workspace.css'
import './fca-prime-list.css'
import './fca-prime-controls.css'
import './record-lists.css'
import './sections-feedback.css'
import './admin-workspace.css'
import './admin-supervisors.css'
import './admin-prime.css'
import './mfa.css'
import './ui-utilities.css'
import './accessibility-interactions.css'
import './primereact.css'
import './extra-cost-alignment.css'
import './extra-cost-final-polish.css'
import './table-final-polish.css'
import './chart-final-polish.css'
import './responsive-final-polish.css'
import './final-parity.css'
import './filter-parity.css'
import './depositor-interactions.css'
import './substitutions-final.css'

const primeReactConfig = {
  ripple: true,
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PrimeReactProvider value={primeReactConfig}>
      <App />
    </PrimeReactProvider>
  </StrictMode>,
)
