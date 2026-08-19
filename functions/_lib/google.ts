import type { Env } from './env'

type SheetValues = string[][]

export interface HubRawData {
  supervisors: SheetValues
  supervisorModules: SheetValues
  depositantes: SheetValues
  indicadores: SheetValues
  substituicoes: SheetValues
  kpiGeral?: SheetValues
  kpiInventario?: SheetValues
  kpiOperacional?: SheetValues
  kpiInventarioDepositante?: SheetValues
  receita?: SheetValues
  despesa?: SheetValues
}

interface HubApiResponse extends HubRawData {
  ok?: boolean
  error?: string
  bridgeVersion?: number
  generatedAt?: string
}

function isSheetValues(value: unknown): value is SheetValues {
  return Array.isArray(value) && value.every((row) => Array.isArray(row))
}

function optionalSheet(value: unknown): SheetValues {
  return isSheetValues(value) ? value : []
}

export async function readHub(env: Env): Promise<HubRawData> {
  const response = await fetch(env.HUB_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({ token: env.HUB_API_TOKEN }),
  })

  if (!response.ok) {
    const detail = await response.text()
    throw new Error(`HUB_BRIDGE_FAILED:${response.status}:${detail.slice(0, 300)}`)
  }

  const payload = await response.json() as HubApiResponse
  if (payload.ok === false) throw new Error(`HUB_BRIDGE_REJECTED:${payload.error ?? 'UNKNOWN'}`)

  if (
    !isSheetValues(payload.supervisors)
    || !isSheetValues(payload.supervisorModules)
    || !isSheetValues(payload.depositantes)
    || !isSheetValues(payload.indicadores)
    || !isSheetValues(payload.substituicoes)
  ) {
    throw new Error('HUB_BRIDGE_INVALID_PAYLOAD')
  }

  return {
    supervisors: payload.supervisors,
    supervisorModules: payload.supervisorModules,
    depositantes: payload.depositantes,
    indicadores: payload.indicadores,
    substituicoes: payload.substituicoes,
    kpiGeral: optionalSheet(payload.kpiGeral),
    kpiInventario: optionalSheet(payload.kpiInventario),
    kpiOperacional: optionalSheet(payload.kpiOperacional),
    kpiInventarioDepositante: optionalSheet(payload.kpiInventarioDepositante),
    receita: optionalSheet(payload.receita),
    despesa: optionalSheet(payload.despesa),
  }
}
