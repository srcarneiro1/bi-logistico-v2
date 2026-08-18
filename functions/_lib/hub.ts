import type { HubRawData } from './google'

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

export function buildHubBootstrap(raw: HubRawData, user: { id: string; email: string }, now = new Date()) {
  const supervisorRows = raw.supervisors.slice(1).filter((row) => val(row, 0))
  const matched = supervisorRows.find((row) => emailKey(val(row, 3)) === emailKey(user.email))
  if (!matched) throw new Error('HUB_USER_NOT_FOUND')

  const perfil = val(matched, 7).toUpperCase() as Perfil
  if (perfil !== 'ADMIN' && perfil !== 'USUARIO') throw new Error('HUB_PROFILE_INVALID')

  const supervisorId = val(matched, 0) || null
  const currentDate = now.toISOString().slice(0, 10)

  const allSupervisors = supervisorRows
    .map((row) => ({
      supervisorId: val(row, 0),
      supervisor: val(row, 1),
      nomeExibicao: val(row, 2) || val(row, 1),
      email: val(row, 3),
      fotoUrl: val(row, 4) || null,
      ativo: yes(val(row, 5)),
      perfilAcesso: (val(row, 7).toUpperCase() || 'USUARIO') as Perfil,
    }))
    .filter((item) => item.supervisorId)

  const allModules = raw.supervisorModules.slice(1)
    .filter((row) => val(row, 0) && val(row, 1))
    .map((row) => ({ supervisorId: val(row, 0), moduloId: val(row, 1), ativo: yes(val(row, 2)) }))

  const allSubstitutions = raw.substituicoes.slice(1)
    .filter((row) => val(row, 0))
    .map((row) => ({
      substituicaoId: val(row, 0),
      supervisorTitularId: val(row, 1),
      supervisorSubstitutoId: val(row, 2),
      supervisorSubstituto: val(row, 3),
      moduloId: val(row, 4),
      dataInicio: parseBrDate(val(row, 5)),
      dataFim: parseBrDate(val(row, 6)),
      ativo: yes(val(row, 8)) && isCurrent(val(row, 5), val(row, 6), currentDate),
    }))

  const activeSubstitutions = allSubstitutions.filter((sub) => sub.ativo)
  const substitutedModules = new Set(
    activeSubstitutions
      .filter((sub) => sub.supervisorSubstitutoId === supervisorId)
      .map((sub) => sub.moduloId),
  )

  const allDepositantes = raw.depositantes.slice(1)
    .filter((row) => val(row, 0) && val(row, 1))
    .map((row) => ({
      cnpj: cnpj14(val(row, 0)),
      nome: val(row, 1),
      codAllStrategy: val(row, 2) || null,
      supervisorId: val(row, 3),
      moduloId: val(row, 4),
      ativo: yes(val(row, 5)),
    }))

  const indicators = raw.indicadores.slice(1)
    .filter((row) => val(row, 0) && val(row, 2))
    .map((row) => ({
      codigo: val(row, 0),
      grupo: val(row, 1),
      indicador: val(row, 2),
      metaPct: parsePercent(val(row, 3)),
      criticoPct: parsePercent(val(row, 4)),
      ativo: yes(val(row, 5)),
    }))
    .filter((item) => item.ativo)

  const isAdmin = perfil === 'ADMIN'
  const substitutionTitularIds = new Set(
    activeSubstitutions
      .filter((sub) => sub.supervisorSubstitutoId === supervisorId)
      .map((sub) => sub.supervisorTitularId),
  )
  const supervisors = isAdmin
    ? allSupervisors.filter((item) => item.ativo)
    : allSupervisors.filter((item) => item.supervisorId === supervisorId || substitutionTitularIds.has(item.supervisorId))
  const supervisorModules = isAdmin
    ? allModules.filter((item) => item.ativo)
    : allModules.filter((item) => item.ativo && (item.supervisorId === supervisorId || substitutedModules.has(item.moduloId)))
  const depositantes = allDepositantes.filter((item) => item.ativo && (
    isAdmin || item.supervisorId === supervisorId || substitutedModules.has(item.moduloId)
  ))

  return {
    profile: {
      id: user.id,
      email: emailKey(user.email),
      nome: val(matched, 2) || val(matched, 1),
      perfil,
      supervisorId: isAdmin ? null : supervisorId,
    },
    profileRow: {
      id: user.id,
      email: emailKey(user.email),
      nome: val(matched, 2) || val(matched, 1),
      perfil,
      supervisor_id: isAdmin ? null : supervisorId,
      ativo: true,
    },
    supervisors,
    supervisorModules,
    depositantes,
    indicadores: indicators,
    substituicoes: isAdmin
      ? activeSubstitutions
      : activeSubstitutions.filter((item) => item.supervisorTitularId === supervisorId || item.supervisorSubstitutoId === supervisorId),
    sourceUpdatedAt: now.toISOString(),
  }
}
