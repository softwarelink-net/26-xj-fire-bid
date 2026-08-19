import {
  type AlarmRow,
  type DeviceRow,
  type Env,
  type PatrolRow,
  CAMPUS_LAYOUT,
  FALLBACK_ALARMS,
  FALLBACK_DEVICES,
  FALLBACK_PATROL,
  RADAR_KPI,
  TREND_SERIES,
  json,
  queryAll,
  requireAuth,
} from '../lib'

export async function handleDashboard(request: Request, env: Env) {
  const auth = await requireAuth(request, env)
  if (auth.error) return auth.error

  const devices = (await queryAll<DeviceRow>(env, 'SELECT * FROM xjfire_devices')) || FALLBACK_DEVICES
  const alarms = (await queryAll<AlarmRow>(env, 'SELECT * FROM xjfire_alarms')) || FALLBACK_ALARMS
  const patrol = (await queryAll<PatrolRow>(env, 'SELECT * FROM xjfire_patrol_logs')) || FALLBACK_PATROL
  const listD = devices.length ? devices : FALLBACK_DEVICES
  const listA = alarms.length ? alarms : FALLBACK_ALARMS
  const listP = patrol.length ? patrol : FALLBACK_PATROL

  const online = listD.filter((d) => d.status === 'ONLINE').length
  const fireAlarms = listA.filter((a) => a.alarm_type === 'FIRE_SMOKE' && a.status !== 'VERIFIED_CLOSED' && a.status !== 'FALSE_ALARM').length
  const sos = listA.filter((a) => a.alarm_type === 'SOS_HELP' && a.status !== 'VERIFIED_CLOSED').length
  const pending = listA.filter((a) => a.status === 'PENDING' || a.status === 'PROCESSING').length
  const health = Math.round((online / Math.max(1, listD.length)) * 100)
  const slaHit = 96

  const heatmap = CAMPUS_LAYOUT.map((z) => {
    const zoneAlarms = listA.filter((a) => a.building_zone === z.name)
    const zoneDevices = listD.filter((d) => d.building_zone === z.name)
    const alarming = zoneDevices.filter((d) => d.status === 'ALARMING' || d.status === 'FAULT').length
    return {
      ...z,
      devices: zoneDevices.length,
      alarms: zoneAlarms.length,
      alarming,
      heat: Math.min(100, zoneAlarms.length * 22 + alarming * 18 + 12),
    }
  })

  const notices = listA.slice(0, 8).map((a) => ({
    id: a.id,
    kind: a.alarm_type,
    title: `${a.device_name} · ${a.floor_room}`,
    host: a.building_zone,
    time: a.created_at,
    status: a.status,
    severity: a.severity,
  }))

  return json({
    success: true,
    data: {
      kpis: {
        devices: listD.length,
        online,
        health,
        fireAlarms,
        sos,
        pending,
        patrolOnline: 12,
        slaHit,
        defects: listP.filter((p) => p.check_status !== 'NORMAL').length,
      },
      heatmap,
      notices,
      trend: TREND_SERIES,
      radar: RADAR_KPI,
      systems: [
        { key: 'VIDEO_SURVEILLANCE', name: '视频监控', count: listD.filter((d) => d.system_type === 'VIDEO_SURVEILLANCE').length },
        { key: 'FIRE_PROTECTION', name: '智慧消防', count: listD.filter((d) => d.system_type === 'FIRE_PROTECTION').length },
        { key: 'EMERGENCY_ALARM', name: '紧急求助', count: listD.filter((d) => d.system_type === 'EMERGENCY_ALARM').length },
        { key: 'ACCESS_CONTROL', name: '门禁一卡通', count: listD.filter((d) => d.system_type === 'ACCESS_CONTROL').length },
        { key: 'ELECTRONIC_PATROL', name: '电子巡更', count: listD.filter((d) => d.system_type === 'ELECTRONIC_PATROL').length },
      ],
    },
  })
}
