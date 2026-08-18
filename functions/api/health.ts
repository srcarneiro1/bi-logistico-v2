import type { PagesFunction } from '@cloudflare/workers-types'
import { json } from '../_lib/http'

export const onRequestGet: PagesFunction = async () => json({
  ok: true,
  service: 'bi-logistico-v2',
  timestamp: new Date().toISOString(),
})
