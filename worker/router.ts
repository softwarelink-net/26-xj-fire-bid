import type { Env } from './lib'
import { CORS_HEADERS, json } from './lib'
import { handleLogin, handleMe } from './handlers/auth'
import { handleListDevices } from './handlers/devices'
import { handleAcknowledgeAlarm, handleListAlarms } from './handlers/alarms'
import { handleCheckinPatrol, handleListPatrol } from './handlers/patrol'
import { handleDashboard } from './handlers/dashboard'
import { handleAuditLogs, handleConfigs, handleUpdateConfig } from './handlers/system'
import { handleHealth, handleTender } from './handlers/tender'

export async function handleApi(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url)
  const path = url.pathname.replace(/\/$/, '') || '/'
  const method = request.method.toUpperCase()

  if (method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS })
  }

  if (path === '/api/health' && method === 'GET') return handleHealth(env)
  if (path === '/api/tender' && method === 'GET') return handleTender()
  if (path === '/api/auth/login' && method === 'POST') return handleLogin(request, env)
  if (path === '/api/auth/me' && method === 'GET') return handleMe(request, env)
  if (path === '/api/devices' && method === 'GET') return handleListDevices(request, env)
  if (path === '/api/alarms' && method === 'GET') return handleListAlarms(request, env)
  if (path === '/api/patrol/logs' && method === 'GET') return handleListPatrol(request, env)
  if (path === '/api/patrol/checkin' && method === 'POST') return handleCheckinPatrol(request, env)
  if (path === '/api/dashboard/stats' && method === 'GET') return handleDashboard(request, env)
  if (path === '/api/system/configs' && method === 'GET') return handleConfigs(request, env)
  if (path === '/api/system/configs' && (method === 'POST' || method === 'PATCH')) {
    return handleUpdateConfig(request, env)
  }
  if (path === '/api/audit' && method === 'GET') return handleAuditLogs(request, env)

  const ackMatch = path.match(/^\/api\/alarms\/([^/]+)\/acknowledge$/)
  if (ackMatch && method === 'POST') return handleAcknowledgeAlarm(request, env, ackMatch[1])

  return json({ success: false, error: 'Not Found' }, 404)
}
