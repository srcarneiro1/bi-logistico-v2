# Validação de ambiente Preview — PR #69

Data: 2026-09-15

Contexto: durante a homologação visual do PR #69, um deployment Preview respondeu no bootstrap da HUB com `HUB_BRIDGE_FAILED:404`.

Validações manuais confirmadas antes deste commit:
- a implantação Apps Script da HUB está ativa;
- a URL do aplicativo da Web termina em `/exec` e responde normalmente;
- `HUB_API_URL` está configurada no ambiente Preview do Cloudflare;
- `HUB_API_TOKEN` está configurado no ambiente Preview e corresponde à propriedade do Apps Script;
- nenhum arquivo de `functions/` ou `apps-script/` foi alterado pelo PR #69.

Este arquivo é apenas um registro de homologação e também força um novo deployment Preview para que a execução use a configuração atual do ambiente. Não altera regra, frontend, backend, autenticação, autorização ou integração.
