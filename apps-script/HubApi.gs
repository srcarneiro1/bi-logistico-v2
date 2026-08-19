/**
 * BI Logístico V2 - ponte somente leitura da HUB revisada.
 *
 * Instalação:
 * 1) Abra HUB_Dados_Unilog_REVISAO_PROPOSTA > Extensões > Apps Script.
 * 2) Cole este arquivo em Code.gs.
 * 3) Em Configurações do projeto > Propriedades do script, crie HUB_API_TOKEN.
 * 4) Implantar > Nova implantação > Aplicativo da Web.
 *    Executar como: você.
 *    Quem tem acesso: qualquer pessoa.
 * 5) Salve a URL /exec no Cloudflare como HUB_API_URL.
 *
 * A aplicação não grava nenhuma célula e não acessa o FCA legado.
 */

const HUB_SHEETS = Object.freeze({
  supervisors: 'dSupervisores',
  supervisorModules: 'dSupervisorModulo',
  depositantes: 'dDepositantes',
  indicadores: 'dIndicadores',
  substituicoes: 'fSubstituicaoSupervisor',
  kpiGeral: 'fKPI_Geral',
  kpiInventario: 'fKPI_Inventario',
  kpiOperacional: 'fKPI_Operacional',
  kpiInventarioDepositante: 'fKPI_InventarioDepositante',
  receita: 'fReceita',
  despesa: 'fDespesa',
});

function doGet() {
  return jsonResponse_({ ok: true, service: 'bi-logistico-v2-hub-bridge', version: 2 });
}

function doPost(e) {
  try {
    const expectedToken = PropertiesService.getScriptProperties().getProperty('HUB_API_TOKEN');
    if (!expectedToken) return jsonResponse_({ ok: false, error: 'TOKEN_NOT_CONFIGURED' });

    const body = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    if (!body.token || body.token !== expectedToken) {
      return jsonResponse_({ ok: false, error: 'UNAUTHORIZED' });
    }

    const cache = CacheService.getScriptCache();
    const cached = cache.get('hub_v2_read_payload_v2');
    if (cached) return ContentService.createTextOutput(cached).setMimeType(ContentService.MimeType.JSON);

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    if (!ss) return jsonResponse_({ ok: false, error: 'SPREADSHEET_NOT_BOUND' });

    const payload = {
      ok: true,
      bridgeVersion: 2,
      generatedAt: new Date().toISOString(),
      supervisors: readSheet_(ss, HUB_SHEETS.supervisors),
      supervisorModules: readSheet_(ss, HUB_SHEETS.supervisorModules),
      depositantes: readSheet_(ss, HUB_SHEETS.depositantes),
      indicadores: readSheet_(ss, HUB_SHEETS.indicadores),
      substituicoes: readSheet_(ss, HUB_SHEETS.substituicoes),
      kpiGeral: readSheet_(ss, HUB_SHEETS.kpiGeral),
      kpiInventario: readSheet_(ss, HUB_SHEETS.kpiInventario),
      kpiOperacional: readSheet_(ss, HUB_SHEETS.kpiOperacional),
      kpiInventarioDepositante: readSheet_(ss, HUB_SHEETS.kpiInventarioDepositante),
      receita: readSheet_(ss, HUB_SHEETS.receita),
      despesa: readSheet_(ss, HUB_SHEETS.despesa),
    };

    const serialized = JSON.stringify(payload);
    cache.put('hub_v2_read_payload_v2', serialized, 120);
    return ContentService.createTextOutput(serialized).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return jsonResponse_({ ok: false, error: String(error && error.message ? error.message : error) });
  }
}

function readSheet_(ss, name) {
  const sheet = ss.getSheetByName(name);
  if (!sheet) throw new Error('SHEET_NOT_FOUND:' + name);
  return sheet.getDataRange().getDisplayValues();
}

function jsonResponse_(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}
