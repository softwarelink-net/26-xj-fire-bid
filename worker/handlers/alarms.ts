import {
  type AlarmRow,
  type Env,
  FALLBACK_ALARMS,
  error,
  isLinkageEnabled,
  isSm4MaskingEnabled,
  json,
  maskPhone,
  nowSql,
  parseBody,
  queryAll,
  queryFirst,
  requireAuth,
  runSql,
  writeAudit,
} from '../lib'

function maskAlarm(row: AlarmRow, masking: boolean): AlarmRow {
  if (!masking || !row.handler_name) return row
  const name = row.handler_name
  return { ...row, handler_name: name.length <= 1 ? '*' : `${name.slice(0, 1)}*` }
}

export async function handleListAlarms(request: Request, env: Env) {
  const auth = await requireAuth(request, env)
  if (auth.error) return auth.error
  const url = new URL(request.url)
  const systemType = url.searchParams.get('system_type') || ''
  const severity = url.searchParams.get('severity') || ''
  const status = url.searchParams.get('status') || ''

  let rows = await queryAll<AlarmRow>(env, 'SELECT * FROM xjfire_alarms ORDER BY created_at DESC')
  if (!rows || !rows.length) rows = FALLBACK_ALARMS
  if (systemType) rows = rows.filter((a) => a.system_type === systemType)
  if (severity) rows = rows.filter((a) => a.severity === severity)
  if (status) rows = rows.filter((a) => a.status === status)

  const masking = await isSm4MaskingEnabled(env)
  return json({
    success: true,
    data: rows.map((r) => maskAlarm(r, masking)),
    total: rows.length,
    masking,
  })
}

export async function handleAcknowledgeAlarm(request: Request, env: Env, id: string) {
  const auth = await requireAuth(request, env, ['ROLE_SECURITY_DISPATCHER', 'ROLE_PATROL_GUARD'])
  if (auth.error) return auth.error

  const body = await parseBody<{ result?: string; dispatch_guard?: string }>(request)
  const linkageOn = await isLinkageEnabled(env)
  const linkage = linkageOn
    ? '【联动执行】球机预置位抓拍 + 门禁强切释放 + 广播疏散 + 就近安保派单'
    : '【联动暂停】Feature Flag 已关闭，仅人工确认，未自动编排跨系统动作'

  const existing = await queryFirst<AlarmRow>(env, 'SELECT * FROM xjfire_alarms WHERE id = ?', [id])
  const handlerName = auth.user.full_name
  const ok = await runSql(
    env,
    `UPDATE xjfire_alarms
     SET status = 'PROCESSING', handler_id = ?, handler_name = ?, linkage_action_executed = ?
     WHERE id = ?`,
    [auth.user.id, handlerName, `${existing?.linkage_action_executed || ''} | ${linkage} | ${body?.result || '值班员确认'}`, id],
  )

  if (!ok) {
    const hit = FALLBACK_ALARMS.find((a) => a.id === id)
    if (hit) {
      hit.status = 'PROCESSING'
      hit.handler_name = handlerName
      hit.handler_id = auth.user.id
      hit.linkage_action_executed = linkage
    }
  }

  await writeAudit(env, auth.user, 'ACKNOWLEDGE_ALARM', request, 200)
  return json({
    success: true,
    data: {
      id,
      status: 'PROCESSING',
      handler_name: handlerName,
      linkage,
      sla_seconds: 60,
      dispatched: body?.dispatch_guard || '张建安',
      acknowledged_at: nowSql(),
      phone: maskPhone(auth.user.phone || '', await isSm4MaskingEnabled(env)),
    },
  })
}
