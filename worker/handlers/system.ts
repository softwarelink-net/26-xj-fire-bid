import {
  type Env,
  FALLBACK_CONFIGS,
  error,
  json,
  parseBody,
  queryAll,
  requireAuth,
  runSql,
  writeAudit,
} from '../lib'

export async function handleConfigs(request: Request, env: Env) {
  const auth = await requireAuth(request, env)
  if (auth.error) return auth.error
  let rows = await queryAll(env, 'SELECT * FROM xjfire_system_configs ORDER BY category, config_key')
  if (!rows || !rows.length) rows = FALLBACK_CONFIGS
  return json({ success: true, data: rows })
}

export async function handleUpdateConfig(request: Request, env: Env) {
  const auth = await requireAuth(request, env)
  if (auth.error) return auth.error
  if (auth.user.role !== 'ROLE_SUPER_ADMIN') return error('仅超级管理员可调整系统参数', 403)
  const body = await parseBody<{ config_key?: string; config_value?: string }>(request)
  if (!body?.config_key || body.config_value === undefined) return error('缺少配置项')
  await runSql(
    env,
    'UPDATE xjfire_system_configs SET config_value = ?, updated_at = CURRENT_TIMESTAMP WHERE config_key = ?',
    [String(body.config_value), body.config_key],
  )
  await writeAudit(env, auth.user, 'UPDATE_CONFIG', request, 200)
  return json({ success: true })
}

export async function handleAuditLogs(request: Request, env: Env) {
  const auth = await requireAuth(request, env, ['ROLE_SUPER_ADMIN'])
  if (auth.error) return auth.error
  const rows = await queryAll(env, 'SELECT * FROM xjfire_audit_logs ORDER BY created_at DESC LIMIT 100')
  return json({ success: true, data: rows || [] })
}
