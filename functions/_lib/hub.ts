import type { HubRawData } from './google'
import type { SupabaseCoverage, SupabaseSubstitute } from './supabase'

type Perfil = 'ADMIN' | 'USUARIO'

function val(row: string[], index: number) { return String(row[index] ?? '').trim() }
function yes(value: string) { return value.trim().toUpperCase() === 'SIM' }
function emailKey(value: string) { return value.trim().toLowerCase() }
function parsePercent(value: string): number | null {
  const raw = value.trim().replace(/\s/g, '')
  if (!raw) return null
  const isPct = raw.endsWith('%')
  const normalized = raw.replace('%', '').replace(/\./g, '').replace(',', '.')
  const n = Number(normalized)
  if (!Number.isFinite(n)) return null
  return isPct ? n / 100 : n
}
function parseMoney(value: string): number | null {
  const raw = value.trim()
  if (!raw) return null
  const negative = raw.startsWith('-') || raw.includes('(')
  const normalized = raw.replace(/[R$\s()]/g, '').replace(/\./g, '').replace(',', '.').replace(/^-/, '')
  const n = Number(normalized)
  return Number.isFinite(n) ? (negative ? -n : n) : null
}
function parseBrDate(value: string): string {
  const clean = value.trim()
  if (!clean) return ''
  const br = clean.match(/^(\d{2})\/(\d{2})\/(\d{4})$/)
  if (br) return `${br[3]}-${br[2]}-${br[1]}`
  const iso = clean.match(/^(\d{4})-(\d{2})-(\d{2})/)
  return iso ? `${iso[1]}-${iso[2]}-${iso[3]}` : clean
}
function cnpj14(value: string): string {
  const digits = value.replace(/\D/g, '')
  return digits.padStart(14, '0').slice(-14)
}
function isCurrent(start: string, end: string, currentDate: string) {
  const from = parseBrDate(start)
  const to = parseBrDate(end)
  return (!from || from <= currentDate) && (!to || to >= currentDate)
}
function rows(raw: string[][] | undefined) { return Array.isArray(raw) ? raw.slice(1) : [] }

export function buildHubBootstrap(
  raw: HubRawData,
  user: { id: string; email: string },
  now = new Date(),
  coverageData?: { substitutes: SupabaseSubstitute[]; coverages: SupabaseCoverage[] },
) {
  const supervisorRows = raw.supervisors.slice(1).filter((row) => val(row, 0))
  const matched = supervisorRows.find((row) => emailKey(val(row, 3)) === emailKey(user.email))
  const currentDate = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo' }).format(now)
  const userEmail = emailKey(user.email)

  const supabaseCoverages = coverageData?.coverages ?? []
  const activeCoverageForEmail = supabaseCoverages.filter((coverage) => (
    coverage.status === 'ATIVA' &&
    emailKey(coverage.substituto_email_snapshot ?? '') === userEmail &&
    isCurrent(coverage.data_inicio, coverage.data_fim, currentDate)
  ))
  const substituteMaster = coverageData?.substitutes.find((item) => item.ativo && emailKey(item.email ?? '') === userEmail)

  if (!matched && (!substituteMaster || activeCoverageForEmail.length === 0)) throw new Error('HUB_USER_NOT_FOUND')

  const perfil = matched ? val(matched, 7).toUpperCase() as Perfil : 'USUARIO'
  if (perfil !== 'ADMIN' && perfil !== 'USUARIO') throw new Error('HUB_PROFILE_INVALID')

  const supervisorId = matched ? (val(matched, 0) || null) : null
  const profileName = matched ? (val(matched, 2) || val(matched, 1)) : (substituteMaster?.nome || 'Substituto')

  const allSupervisors = supervisorRows.map((row) => ({
    supervisorId: val(row, 0), supervisor: val(row, 1), nomeExibicao: val(row, 2) || val(row, 1), email: val(row, 3), fotoUrl: val(row, 4) || null,
    ativo: yes(val(row, 5)), perfilAcesso: (val(row, 7).toUpperCase() || 'USUARIO') as Perfil,
  })).filter((item) => item.supervisorId)

  const allModules = raw.supervisorModules.slice(1).filter((row) => val(row, 0) && val(row, 1)).map((row) => ({ supervisorId: val(row, 0), moduloId: val(row, 1), ativo: yes(val(row, 2)) }))

  const legacySubstitutions = raw.substituicoes.slice(1).filter((row) => val(row, 0)).map((row) => ({
    substituicaoId: val(row, 0), legacySubstituicaoId: val(row, 0), supervisorTitularId: val(row, 1), supervisorSubstitutoId: val(row, 2), supervisorSubstituto: val(row, 3), supervisorSubstitutoEmail: null as string | null, substitutoMasterId: null as string | null, moduloId: val(row, 4),
    dataInicio: parseBrDate(val(row, 5)), dataFim: parseBrDate(val(row, 6)), motivo: val(row, 7) || null,
    ativo: yes(val(row, 8)) && isCurrent(val(row, 5), val(row, 6), currentDate), status: yes(val(row, 8)) ? 'ATIVA' : 'ENCERRADA', origem: 'HUB' as const,
  }))
  const managedSubstitutions = supabaseCoverages.map((coverage) => ({
    substituicaoId: coverage.id,
    legacySubstituicaoId: coverage.legacy_substituicao_id,
    supervisorTitularId: coverage.supervisor_titular_id,
    supervisorSubstitutoId: coverage.substituto_codigo_snapshot,
    supervisorSubstituto: coverage.substituto_nome_snapshot,
    supervisorSubstitutoEmail: coverage.substituto_email_snapshot,
    substitutoMasterId: coverage.substituto_master_id,
    moduloId: coverage.modulo_id,
    dataInicio: coverage.data_inicio,
    dataFim: coverage.data_fim,
    motivo: coverage.motivo,
    status: coverage.status,
    ativo: coverage.status === 'ATIVA' && isCurrent(coverage.data_inicio, coverage.data_fim, currentDate),
    origem: 'SUPABASE' as const,
  }))
  const allSubstitutions = managedSubstitutions.length ? managedSubstitutions : legacySubstitutions
  const activeSubstitutions = allSubstitutions.filter((sub) => sub.ativo)
  const userIsSubstitute = (sub: typeof allSubstitutions[number]) => (
    (supervisorId && sub.supervisorSubstitutoId === supervisorId) || emailKey(sub.supervisorSubstitutoEmail ?? '') === userEmail
  )
  const substitutedModules = new Set(activeSubstitutions.filter(userIsSubstitute).map((sub) => sub.moduloId))

  const allDepositantes = raw.depositantes.slice(1).filter((row) => val(row, 0) && val(row, 1)).map((row) => ({
    cnpj: cnpj14(val(row, 0)), nome: val(row, 1), codAllStrategy: val(row, 2) || null, supervisorId: val(row, 3), moduloId: val(row, 4), ativo: yes(val(row, 5)),
  }))

  const indicators = raw.indicadores.slice(1).filter((row) => val(row, 0) && val(row, 2)).map((row) => ({
    codigo: val(row, 0), grupo: val(row, 1), indicador: val(row, 2), metaPct: parsePercent(val(row, 3)), criticoPct: parsePercent(val(row, 4)), ativo: yes(val(row, 5)),
  })).filter((item) => item.ativo)

  const isAdmin = perfil === 'ADMIN'
  const substitutionTitularIds = new Set(activeSubstitutions.filter(userIsSubstitute).map((sub) => sub.supervisorTitularId))
  const supervisors = isAdmin ? allSupervisors.filter((item) => item.ativo) : allSupervisors.filter((item) => item.supervisorId === supervisorId || substitutionTitularIds.has(item.supervisorId))
  const supervisorModules = isAdmin ? allModules.filter((item) => item.ativo) : allModules.filter((item) => item.ativo && (item.supervisorId === supervisorId || substitutedModules.has(item.moduloId)))
  const depositantes = allDepositantes.filter((item) => item.ativo && (isAdmin || item.supervisorId === supervisorId || substitutedModules.has(item.moduloId)))
  const canSeeScopedRow = (rowSupervisorId: string, moduloId: string) => isAdmin || rowSupervisorId === supervisorId || substitutedModules.has(moduloId)

  const kpiGeral = isAdmin ? rows(raw.kpiGeral).filter((row) => val(row, 0) && val(row, 2)).map((row) => ({ periodo: val(row, 0), codigo: val(row, 1), kpi: val(row, 2), valorPct: parsePercent(val(row, 3)) })) : []
  const kpiInventario = isAdmin ? rows(raw.kpiInventario).filter((row) => val(row, 0) && val(row, 2)).map((row) => ({ periodo: val(row, 0), codigo: val(row, 1), kpiTipo: val(row, 2), valorPct: parsePercent(val(row, 3)) })) : []
  const kpiOperacional = rows(raw.kpiOperacional).filter((row) => val(row, 0) && val(row, 1)).map((row) => ({
    periodo: val(row, 0), nomeDepositante: val(row, 1), cnpj: cnpj14(val(row, 2)), supervisorId: val(row, 3), moduloId: val(row, 4), producaoPct: parsePercent(val(row, 5)), recebimentoPct: parsePercent(val(row, 6)),
  })).filter((item) => canSeeScopedRow(item.supervisorId, item.moduloId))
  const kpiInventarioDepositante = rows(raw.kpiInventarioDepositante).filter((row) => val(row, 0) && val(row, 1)).map((row) => ({
    periodo: val(row, 0), nomeDepositante: val(row, 1), cnpj: cnpj14(val(row, 2)), supervisorId: val(row, 3), moduloId: val(row, 4), prazoPct: parsePercent(val(row, 5)), enderecoPct: parsePercent(val(row, 6)), unidadePct: parsePercent(val(row, 7)), skuPct: parsePercent(val(row, 8)), totalPct: parsePercent(val(row, 9)),
  })).filter((item) => canSeeScopedRow(item.supervisorId, item.moduloId))
  const receita = rows(raw.receita).filter((row) => val(row, 0) && val(row, 1)).map((row) => ({
    periodo: val(row, 0), nomeDepositante: val(row, 1), cnpj: cnpj14(val(row, 2)), codAllStrategy: val(row, 3), supervisorId: val(row, 4), moduloId: val(row, 5), receitaPlanejada: parseMoney(val(row, 6)), receitaRealizada: parseMoney(val(row, 7)),
  })).filter((item) => canSeeScopedRow(item.supervisorId, item.moduloId))
  const despesa = isAdmin ? rows(raw.despesa).filter((row) => val(row, 0) && val(row, 1)).map((row) => ({ periodo: val(row, 0), codAllStrategy: val(row, 1), despesaPlanejada: parseMoney(val(row, 2)), despesaRealizada: parseMoney(val(row, 3)) })) : []

  const visibleSubstitutions = isAdmin ? allSubstitutions : allSubstitutions.filter((item) => item.supervisorTitularId === supervisorId || userIsSubstitute(item))

  return {
    profile: { id: user.id, email: userEmail, nome: profileName, perfil, supervisorId: isAdmin ? null : supervisorId },
    profileRow: { id: user.id, email: userEmail, nome: profileName, perfil, supervisor_id: isAdmin ? null : supervisorId, ativo: true },
    supervisors, supervisorModules, depositantes, indicadores: indicators,
    substitutos: isAdmin ? (coverageData?.substitutes ?? []) : [],
    substituicoes: visibleSubstitutions,
    facts: { kpiGeral, kpiInventario, kpiOperacional, kpiInventarioDepositante, receita, despesa },
    analyticsReady: Boolean(raw.kpiOperacional?.length || raw.kpiGeral?.length || raw.receita?.length),
    sourceUpdatedAt: now.toISOString(),
  }
}
