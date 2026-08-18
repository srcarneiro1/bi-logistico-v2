import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { deriveFcaStatus, isFcaOverdue, listFcas } from '../lib/fca'
import type { FcaWithActions } from '../types/fca'
import type { HubBootstrap } from '../types/hub'

export function FcaListPage({ hub }: { hub: HubBootstrap }) {
  const [rows, setRows] = useState<FcaWithActions[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [supervisorId, setSupervisorId] = useState('')
  const [moduloId, setModuloId] = useState('')

  useEffect(() => {
    setLoading(true)
    void listFcas().then(setRows).catch((err) => setError(err instanceof Error ? err.message : 'Erro ao carregar FCA.')).finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => rows.filter((row) => {
    const derived = deriveFcaStatus(row)
    if (status === 'VENCIDO' && !isFcaOverdue(row)) return false
    if (status && status !== 'VENCIDO' && derived !== status) return false
    if (supervisorId && row.supervisor_id !== supervisorId && row.substituto_id !== supervisorId) return false
    if (moduloId && row.modulo_id !== moduloId) return false
    if (search.trim()) {
      const q = search.trim().toLocaleLowerCase('pt-BR')
      const hay = `${row.numero} ${row.depositante_nome} ${row.indicador_nome} ${row.supervisor_nome} ${row.causa}`.toLocaleLowerCase('pt-BR')
      if (!hay.includes(q)) return false
    }
    return true
  }), [rows, status, supervisorId, moduloId, search])

  const modules = Array.from(new Set(hub.supervisorModules.map((item) => item.moduloId))).sort()

  return (
    <section>
      <div className="page-header page-header-row">
        <div><span className="eyebrow">FCA</span><h1>Fatos, causas e ações</h1><p>Consulta dos registros autorizados para o seu perfil.</p></div>
        <Link className="button button-primary" to="/fca/novo">Novo FCA</Link>
      </div>
      <div className="filters-panel">
        <input placeholder="Pesquisar FCA, depositante, causa…" value={search} onChange={(e) => setSearch(e.target.value)} />
        <select value={supervisorId} onChange={(e) => setSupervisorId(e.target.value)}><option value="">Todos os supervisores</option>{hub.supervisors.map((item) => <option key={item.supervisorId} value={item.supervisorId}>{item.nomeExibicao}</option>)}</select>
        <select value={moduloId} onChange={(e) => setModuloId(e.target.value)}><option value="">Todos os módulos</option>{modules.map((item) => <option key={item}>{item}</option>)}</select>
        <select value={status} onChange={(e) => setStatus(e.target.value)}><option value="">Todos os status</option><option value="ABERTO">Aberto</option><option value="EM_ANDAMENTO">Em andamento</option><option value="CONCLUIDO">Concluído</option><option value="VENCIDO">Vencido</option><option value="CANCELADO">Cancelado</option></select>
      </div>
      {loading && <div className="panel">Carregando FCA…</div>}
      {error && <div className="notice notice-error">{error}</div>}
      {!loading && !error && (
        <div className="table-wrap">
          <table>
            <thead><tr><th>FCA</th><th>Data</th><th>Depositante</th><th>KPI</th><th>Supervisor</th><th>Módulo</th><th>Status</th></tr></thead>
            <tbody>
              {filtered.map((row) => {
                const derived = deriveFcaStatus(row)
                const overdue = isFcaOverdue(row)
                return <tr key={row.id}><td><Link to={`/fca/${row.id}`}>#{String(row.numero).padStart(5, '0')}</Link></td><td>{new Date(`${row.data_reuniao}T12:00:00`).toLocaleDateString('pt-BR')}</td><td>{row.depositante_nome}</td><td>{row.indicador_nome}</td><td>{row.supervisor_nome}</td><td>{row.modulo_id}</td><td><span className={`status-badge status-${overdue ? 'VENCIDO' : derived}`}>{overdue ? 'VENCIDO' : derived.replace('_', ' ')}</span></td></tr>
              })}
              {filtered.length === 0 && <tr><td colSpan={7} className="table-empty">Nenhum FCA encontrado.</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
