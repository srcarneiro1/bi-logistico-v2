import { describe, expect, it } from 'vitest'
import { buildHubBootstrap } from '../functions/_lib/hub'
import type { HubRawData } from '../functions/_lib/google'
import type { SupabaseCoverage, SupabaseSubstitute } from '../functions/_lib/supabase'

const rawHub: HubRawData = {
  supervisors: [
    ['SupervisorId','Supervisor','NomeExibicao','Email','FotoUrl','Ativo','','PerfilAcesso'],
    ['SUP-A','Supervisor A','Supervisor A','a@empresa.com','','SIM','','USUARIO'],
    ['SUP-B','Supervisor B','Supervisor B','b@empresa.com','','SIM','','USUARIO'],
  ],
  supervisorModules: [
    ['SupervisorId','ModuloId','Ativo'],
    ['SUP-A','MOD-01','SIM'],
    ['SUP-B','MOD-01','SIM'],
  ],
  depositantes: [
    ['CNPJ','Nome','CodAllStrategy','SupervisorId','ModuloId','Ativo'],
    ['11111111111111','Depositante A','A1','SUP-A','MOD-01','SIM'],
    ['22222222222222','Depositante B','B1','SUP-B','MOD-01','SIM'],
  ],
  indicadores: [
    ['Codigo','Grupo','Indicador','Meta','Critico','Ativo'],
    ['PROD','KPI','Lead Time Produção','95%','90%','SIM'],
  ],
  substituicoes: [['Id','Titular','Substituto','Nome','Modulo','Inicio','Fim','Motivo','Ativo']],
  kpiOperacional: [
    ['Periodo','Depositante','CNPJ','SupervisorId','ModuloId','Producao','Recebimento'],
    ['ago/2026','Depositante A','11111111111111','SUP-A','MOD-01','96%','97%'],
    ['ago/2026','Depositante B','22222222222222','SUP-B','MOD-01','80%','81%'],
  ],
  kpiInventarioDepositante: [
    ['Periodo','Depositante','CNPJ','SupervisorId','ModuloId','Prazo','Endereco','Unidade','SKU','Total'],
    ['ago/2026','Depositante A','11111111111111','SUP-A','MOD-01','96%','96%','96%','96%','96%'],
    ['ago/2026','Depositante B','22222222222222','SUP-B','MOD-01','80%','80%','80%','80%','80%'],
  ],
  receita: [
    ['Periodo','Depositante','CNPJ','CodAllStrategy','SupervisorId','ModuloId','Planejada','Realizada'],
    ['ago/2026','Depositante A','11111111111111','A1','SUP-A','MOD-01','1000','1000'],
    ['ago/2026','Depositante B','22222222222222','B1','SUP-B','MOD-01','1000','800'],
  ],
  kpiGeral: [],
  kpiInventario: [],
  despesa: [],
}

const substitute: SupabaseSubstitute = {
  id: 'sub-1',
  codigo: 'SUB-1',
  nome: 'Substituto',
  email: 'sub@empresa.com',
  fotoUrl: null,
  ativo: true,
}

const coverage: SupabaseCoverage = {
  id: 'cov-1',
  legacy_substituicao_id: null,
  supervisor_titular_id: 'SUP-A',
  supervisor_titular_nome: 'Supervisor A',
  substituto_master_id: 'sub-1',
  substituto_codigo_snapshot: 'SUB-1',
  substituto_nome_snapshot: 'Substituto',
  substituto_email_snapshot: 'sub@empresa.com',
  substituto_foto_url_snapshot: null,
  modulo_id: 'MOD-01',
  data_inicio: '2026-08-01',
  data_fim: '2026-08-31',
  motivo: 'Férias',
  status: 'ATIVA',
}

describe('bootstrap de cobertura', () => {
  it('autoriza somente o par supervisor titular + módulo coberto', () => {
    const hub = buildHubBootstrap(
      rawHub,
      { id: 'auth-sub', email: 'sub@empresa.com' },
      new Date('2026-08-21T12:00:00-03:00'),
      { substitutes: [substitute], coverages: [coverage] },
    )

    expect(hub.supervisors.map(item => item.supervisorId)).toEqual(['SUP-A'])
    expect(hub.supervisorModules.map(item => `${item.supervisorId}|${item.moduloId}`)).toEqual(['SUP-A|MOD-01'])
    expect(hub.depositantes.map(item => item.nome)).toEqual(['Depositante A'])
    expect(hub.facts.kpiOperacional.map(item => item.nomeDepositante)).toEqual(['Depositante A'])
    expect(hub.facts.kpiInventarioDepositante.map(item => item.nomeDepositante)).toEqual(['Depositante A'])
    expect(hub.facts.receita.map(item => item.nomeDepositante)).toEqual(['Depositante A'])
  })

  it('mantém o escopo próprio de um supervisor e soma somente a cobertura autorizada', () => {
    const supervisorAsSubstitute = { ...substitute, codigo: 'SUP-A', email: 'a@empresa.com' }
    const supervisorCoverage = {
      ...coverage,
      supervisor_titular_id: 'SUP-B',
      supervisor_titular_nome: 'Supervisor B',
      substituto_codigo_snapshot: 'SUP-A',
      substituto_email_snapshot: 'a@empresa.com',
    }

    const hub = buildHubBootstrap(
      rawHub,
      { id: 'auth-a', email: 'a@empresa.com' },
      new Date('2026-08-21T12:00:00-03:00'),
      { substitutes: [supervisorAsSubstitute], coverages: [supervisorCoverage] },
    )

    expect(new Set(hub.supervisors.map(item => item.supervisorId))).toEqual(new Set(['SUP-A','SUP-B']))
    expect(new Set(hub.depositantes.map(item => item.nome))).toEqual(new Set(['Depositante A','Depositante B']))
  })

  it('admin delegado recebe dados administrativos sem ganhar escopo analítico global', () => {
    const hub = buildHubBootstrap(
      rawHub,
      { id: 'auth-a', email: 'a@empresa.com' },
      new Date('2026-08-21T12:00:00-03:00'),
      { substitutes: [substitute], coverages: [coverage] },
      'ADMIN',
    )

    expect(hub.depositantes.map(item => item.nome)).toEqual(['Depositante A'])
    expect(hub.facts.kpiOperacional.map(item => item.nomeDepositante)).toEqual(['Depositante A'])
    expect(hub.substitutos.map(item => item.nome)).toEqual(['Substituto'])
    expect(hub.substituicoes.map(item => item.substituicaoId)).toEqual(['cov-1'])
  })
})
