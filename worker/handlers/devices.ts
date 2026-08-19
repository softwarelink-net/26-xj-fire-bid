import { type DeviceRow, type Env, FALLBACK_DEVICES, json, queryAll, requireAuth } from '../lib'

export async function handleListDevices(request: Request, env: Env) {
  const auth = await requireAuth(request, env)
  if (auth.error) return auth.error
  const url = new URL(request.url)
  const systemType = url.searchParams.get('system_type') || ''
  const zone = url.searchParams.get('building_zone') || ''

  let rows = await queryAll<DeviceRow>(env, 'SELECT * FROM xjfire_devices ORDER BY system_type, device_code')
  if (!rows || !rows.length) rows = FALLBACK_DEVICES
  if (systemType) rows = rows.filter((d) => d.system_type === systemType)
  if (zone) rows = rows.filter((d) => d.building_zone === zone)
  return json({ success: true, data: rows, total: rows.length })
}
