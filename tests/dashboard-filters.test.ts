import { describe, expect, it } from 'vitest'
import { defaultPeriod, periodKey, scoped } from '../src/lib/dashboard'
import type { DashboardFilters } from '../src/types/dashboard'
import type { HubBootstrap } from '../src/types/hub'

describe('normalização e escopo analítico', () => {
  it('normaliza competências em formatos usados pela HUB', () => {
    expect(periodKey('ago/2026')).toBe('2026-08')
    expect(periodKey('ago. 2026')).toBe('2026-08')
    expect(periodKey('2026-08')).toBe('2026-08')
    expect(periodKey('2026-08-21')).toBe('2026-08')
  })

  it('mantém o período da FCA independente do filtro analítico', () => {
    const rows = [
      { periodo: 'jul/2026', supervisorId: 'SUP-A', moduloId: 'MOD-01', value: 1 },
      { periodo: 'ago/2026', supervisorId: 'SUP-A', moduloId: 'MOD-01', value: 2 },
    ]
    const filters: DashboardFilters = {
      periodo: 'ago/2026',
      fcaPeriodo: 'ALL',
      supervisorId: 'SUP-A',
      moduloId: 'MOD-01',
    }

    expect(scoped(rows, filters).map(row => row.value)).toEqual([2])
  })

  it('escolhe o mês atual quando disponível e não avança para mês futuro', () => {
    const hub = {
      facts: {
        kpiGeral: [
          { periodo: 'jul/2026', codigo: '1', kpi: 'KPI', valorPct: 1 },
          { periodo: 'ago/2026', codigo: '1', kpi: 'KPI', valorPct: 1 },
          { periodo: 'set/2026', codigo: '1', kpi: 'KPI', valorPct: 1 },
        ],
        kpiInventario: [], kpiOperacional: [], kpiInventarioDepositante: [], receita: [], despesa: [],
      },
    } as unknown as HubBootstrap

    expect(periodKey(defaultPeriod(hub, new Date('2026-08-21T12:00:00-03:00')))).toBe('2026-08')
    expect(periodKey(defaultPeriod(hub, new Date('2026-08-01T12:00:00-03:00')))).toBe('2026-08')
  })
})
