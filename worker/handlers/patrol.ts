import {
  type Env,
  type PatrolRow,
  FALLBACK_PATROL,
  error,
  json,
  nowSql,
  parseBody,
  queryAll,
  requireAuth,
  runSql,
  writeAudit,
} from '../lib'

export async function handleListPatrol(request: Request, env: Env) {
  const auth = await requireAuth(request, env)
  if (auth.error) return auth.error
  let rows = await queryAll<PatrolRow>(env, 'SELECT * FROM xjfire_patrol_logs ORDER BY plan_time DESC')
  if (!rows || !rows.length) rows = FALLBACK_PATROL
  const stats = {
    normal: rows.filter((r) => r.check_status === 'NORMAL').length,
    defect: rows.filter((r) => r.check_status === 'DEFECT_FOUND').length,
    missed: rows.filter((r) => r.check_status === 'MISSED').length,
    timeout: rows.filter((r) => r.check_status === 'TIMEOUT').length,
  }
  return json({ success: true, data: rows, total: rows.length, stats })
}

export async function handleCheckinPatrol(request: Request, env: Env) {
  const auth = await requireAuth(request, env, ['ROLE_PATROL_GUARD'])
  if (auth.error) return auth.error
  const body = await parseBody<{
    id?: string
    checkpoint_rfid?: string
    check_status?: string
    defect_description?: string
  }>(request)
  if (!body?.id && !body?.checkpoint_rfid) return error('缺少打卡点位')

  const status = body.check_status || 'NORMAL'
  const actual = nowSql()
  if (body.id) {
    await runSql(
      env,
      `UPDATE xjfire_patrol_logs SET actual_time = ?, check_status = ?, defect_description = ? WHERE id = ?`,
      [actual, status, body.defect_description || null, body.id],
    )
  }

  await writeAudit(env, auth.user, 'PATROL_CHECKIN', request, 200)
  return json({
    success: true,
    data: {
      guard_name: auth.user.full_name,
      checkpoint_rfid: body.checkpoint_rfid,
      actual_time: actual,
      check_status: status,
      defect_description: body.defect_description || null,
    },
  })
}
