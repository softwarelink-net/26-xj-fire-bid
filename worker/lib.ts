/// <reference types="@cloudflare/workers-types" />

export interface Env {
  Allworld: D1Database
  ASSETS?: Fetcher
  STORAGE?: R2Bucket
  SITES?: R2Bucket
  JWT_SECRET: string
  PROJECT_SLUG: string
  REPO_NAME: string
  DEPLOYMENT_HOST: string
  HOST_DOMAIN: string
  ROOT_DOMAIN: string
}

export type Role = 'ROLE_SUPER_ADMIN' | 'ROLE_SECURITY_DISPATCHER' | 'ROLE_PATROL_GUARD' | 'ROLE_DECISION_MAKER'

export interface AuthUser {
  id: string
  username: string
  full_name: string
  department: string
  role: Role
  phone?: string
  badge_no?: string
}

export interface DeviceRow {
  id: string
  device_code: string
  device_name: string
  system_type: string
  building_zone: string
  floor_room: string
  ip_address?: string | null
  status: string
  last_metric_value?: number | null
}

export interface AlarmRow {
  id: string
  alarm_no: string
  system_type: string
  device_id: string
  device_name: string
  building_zone: string
  floor_room: string
  alarm_type: string
  severity: string
  linkage_action_executed?: string | null
  snapshot_url?: string | null
  handler_id?: string | null
  handler_name?: string | null
  status: string
  created_at?: string
  resolved_at?: string | null
}

export interface PatrolRow {
  id: string
  task_no: string
  guard_id: string
  guard_name: string
  route_name: string
  checkpoint_name: string
  checkpoint_rfid: string
  plan_time: string
  actual_time?: string | null
  check_status: string
  defect_description?: string | null
}

export const CORS_HEADERS: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

export const DEMO_PASSWORDS: Record<string, string> = {
  admin: 'Admin@2026',
  dispatcher: 'Dispatch@2026',
  guard: 'Guard@2026',
  leader: 'Leader@2026',
}

export const MOCK_USERS: AuthUser[] = [
  {
    id: 'u-01',
    username: 'admin',
    full_name: '系统超级管理员',
    department: '保卫处监控中心',
    role: 'ROLE_SUPER_ADMIN',
    phone: '0991-4362391',
    badge_no: 'XJ-ADMIN-01',
  },
  {
    id: 'u-02',
    username: 'dispatcher',
    full_name: '买合木提·艾力',
    department: '消防保卫监控中心',
    role: 'ROLE_SECURITY_DISPATCHER',
    phone: '0991-4362392',
    badge_no: 'XJ-DISP-08',
  },
  {
    id: 'u-03',
    username: 'guard',
    full_name: '张建安',
    department: '保卫处巡更机动队',
    role: 'ROLE_PATROL_GUARD',
    phone: '13909918801',
    badge_no: 'XJ-GUARD-22',
  },
  {
    id: 'u-04',
    username: 'leader',
    full_name: '李副院长',
    department: '新疆医科大学第一附属医院院领导',
    role: 'ROLE_DECISION_MAKER',
    phone: '0991-4362300',
    badge_no: 'XJ-LEAD-01',
  },
]

export function json(data: unknown, status = 200, extraHeaders: Record<string, string> = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      ...CORS_HEADERS,
      ...extraHeaders,
    },
  })
}

export function error(message: string, status = 400) {
  return json({ success: false, error: message }, status)
}

export async function parseBody<T = Record<string, unknown>>(request: Request): Promise<T | null> {
  try {
    return (await request.json()) as T
  } catch {
    return null
  }
}

export function getDB(env: Env): D1Database | undefined {
  return env.Allworld
}

function bytesToBase64Url(bytes: ArrayBuffer | Uint8Array) {
  const arr = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes)
  let bin = ''
  for (let i = 0; i < arr.length; i++) bin += String.fromCharCode(arr[i])
  return btoa(bin).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
}

function utf8ToBase64Url(str: string) {
  return bytesToBase64Url(new TextEncoder().encode(str))
}

function base64UrlToBytes(s: string) {
  const pad = s.replace(/-/g, '+').replace(/_/g, '/')
  const padded = pad + '='.repeat((4 - (pad.length % 4)) % 4)
  const bin = atob(padded)
  const out = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i)
  return out
}

function base64UrlToUtf8(s: string) {
  return new TextDecoder().decode(base64UrlToBytes(s))
}

export async function signJwt(payload: Record<string, unknown>, secret: string) {
  const header = { alg: 'HS256', typ: 'JWT' }
  const h = utf8ToBase64Url(JSON.stringify(header))
  const p = utf8ToBase64Url(JSON.stringify({ ...payload, iat: Date.now(), exp: Date.now() + 8 * 3600 * 1000 }))
  const data = `${h}.${p}`
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(data))
  return `${data}.${bytesToBase64Url(sig)}`
}

export async function verifyJwt(token: string, secret: string) {
  if (!token) return null
  const parts = token.replace(/^Bearer\s+/i, '').split('.')
  if (parts.length !== 3) return null
  const data = `${parts[0]}.${parts[1]}`
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['verify'],
  )
  const ok = await crypto.subtle.verify('HMAC', key, base64UrlToBytes(parts[2]), new TextEncoder().encode(data))
  if (!ok) return null
  try {
    const payload = JSON.parse(base64UrlToUtf8(parts[1])) as Record<string, unknown> & { exp?: number }
    if (payload.exp && Date.now() > payload.exp) return null
    return payload
  } catch {
    return null
  }
}

export async function requireAuth(request: Request, env: Env, roles: Role[] = []) {
  const auth = request.headers.get('Authorization') || ''
  const secret = env.JWT_SECRET || 'xj-fire-bid-demo-jwt-secret-2026'
  const payload = (await verifyJwt(auth, secret)) as AuthUser | null
  if (!payload?.id) return { error: error('未授权，请先登录', 401) }
  if (roles.length && payload.role !== 'ROLE_SUPER_ADMIN' && !roles.includes(payload.role)) {
    return { error: error('权限不足', 403) }
  }
  return { user: payload }
}

export async function queryAll<T = Record<string, unknown>>(env: Env, sql: string, binds: unknown[] = []) {
  const db = getDB(env)
  if (!db) return null
  try {
    const stmt = db.prepare(sql)
    const res = binds.length ? await stmt.bind(...binds).all() : await stmt.all()
    return (res.results || []) as T[]
  } catch {
    return null
  }
}

export async function queryFirst<T = Record<string, unknown>>(env: Env, sql: string, binds: unknown[] = []) {
  const db = getDB(env)
  if (!db) return null
  try {
    const stmt = db.prepare(sql)
    return (binds.length ? await stmt.bind(...binds).first() : await stmt.first()) as T | null
  } catch {
    return null
  }
}

export async function runSql(env: Env, sql: string, binds: unknown[] = []) {
  const db = getDB(env)
  if (!db) return false
  try {
    const stmt = db.prepare(sql)
    if (binds.length) await stmt.bind(...binds).run()
    else await stmt.run()
    return true
  } catch {
    return false
  }
}

export function clientIp(request: Request) {
  return request.headers.get('CF-Connecting-IP') || request.headers.get('X-Forwarded-For') || '127.0.0.1'
}

export function newId(prefix: string) {
  return `${prefix}-${crypto.randomUUID().replace(/-/g, '').slice(0, 12)}`
}

export function nowSql() {
  return new Date().toISOString().slice(0, 19).replace('T', ' ')
}

export function maskPhone(value: string, enabled = true) {
  if (!enabled || !value) return value
  if (value.length < 7) return '****'
  return `${value.slice(0, 3)}****${value.slice(-4)}`
}

export const FALLBACK_CONFIGS = [
  {
    config_key: 'FEATURE_AUTO_CROSS_LINKAGE',
    config_value: 'true',
    category: 'FEATURE_FLAG',
    description: '是否开启火警/求助触发视频预置位抓拍与门禁强切联动',
  },
  {
    config_key: 'FEATURE_SM4_DATA_MASKING',
    config_value: 'true',
    category: 'SECURITY',
    description: '是否启用医护人员手机号及值班门禁刷卡信息国密 SM4 动态脱敏',
  },
  {
    config_key: 'EMERGENCY_RESPONSE_SLA_SECONDS',
    config_value: '60',
    category: 'SLA',
    description: '急诊一键求助安保人员到达现场标准响应时限（秒）',
  },
]

async function flagOn(env: Env, key: string, fallback = true) {
  const row = await queryFirst<{ config_value: string }>(
    env,
    'SELECT config_value FROM xjfire_system_configs WHERE config_key = ?',
    [key],
  )
  if (!row) {
    const fb = FALLBACK_CONFIGS.find((c) => c.config_key === key)
    if (!fb) return fallback
    return fb.config_value === 'true'
  }
  return row.config_value === 'true'
}

export async function isLinkageEnabled(env: Env) {
  return flagOn(env, 'FEATURE_AUTO_CROSS_LINKAGE', true)
}

export async function isSm4MaskingEnabled(env: Env) {
  return flagOn(env, 'FEATURE_SM4_DATA_MASKING', true)
}

export async function writeAudit(
  env: Env,
  user: AuthUser | null | undefined,
  actionName: string,
  request: Request,
  statusCode: number,
) {
  const url = new URL(request.url)
  await runSql(
    env,
    `INSERT INTO xjfire_audit_logs (id, user_id, username, action_name, ip_address, request_uri, request_method, status_code)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      newId('aud'),
      user?.id || null,
      user?.username || 'anonymous',
      actionName,
      clientIp(request),
      url.pathname,
      request.method,
      statusCode,
    ],
  )
}

export const TENDER = {
  title: '新疆医科大学第一附属医院智慧消防系统等5项采购项目公开招标公告',
  issuer: '新疆医科大学第一附属医院',
  project_no: 'XZJ266-100（3）-ZK',
  publish_time: '2026-08-13 19:01',
  keywords:
    '新疆医科大学第一附属医院, 智慧消防系统, 视频监控系统, 门禁一卡通, 弱电智能化, XZJ266-100（3）-ZK, 医院安防采购, 新疆政府采购',
  summary:
    '新疆医科大学第一附属医院公开招标智慧消防系统等5项采购项目，预算金额922,215.12元，包含视频监控系统、入侵报警及紧急求助系统、门禁及一卡通系统、电子巡更系统、智慧消防系统各1套。投标人须具备电子与智能化工程专业承包二级及以上资质且具备安全生产许可证，通过政采云平台线上投标，投标文件递交截止时间为2026年9月4日16:00。',
  budget: 922215.12,
  deadline: '2026-09-04 16:00:00',
  period: '按招标文件约定',
  qualification: '电子与智能化工程专业承包二级及以上资质，并具备安全生产许可证',
  tech_points: [
    '五大异构弱电子系统全域融合：深度集成视频监控、入侵报警/紧急求助、门禁一卡通、电子巡更、智慧消防 5 套系统。',
    '跨系统秒级应急协同与联动编排：支持火灾与求助信号触发多路视频自动切换、门禁紧急疏散释放与广播联动。',
    '电子巡更与隐患闭环流转：实现巡更点位 RFID/蓝牙精准核验与通道堵塞、设备损坏等隐患工单全流程追溯。',
    '信创国密脱敏与极简 Serverless 架构：敏感人员信息国密 SM4 动态脱敏，基于 Cloudflare Workers + D1 高性能承载。',
  ],
  innovation: [
    '医院三维空间与安防消防态势感知雷达：立体呈现门诊楼、住院楼与医技楼等重点部位设备运行与隐患分布。',
    '智能医护紧急求助一键处置链条：融合求助弹窗、就近安保定位与视频跟踪，实现 1 分钟快速到达现场响应。',
  ],
  ca_guide: [
    '登录新疆政府采购网 / 政采云平台完成供应商注册、实名认证与电子签章绑定。',
    '申领符合国密 SM2 标准的 CA 数字证书（USB Key），安装驱动与电子签章控件。',
    '使用 CA 对投标文件加密签章后，于 2026 年 9 月 4 日 16:00 前完成网上递交。',
    '投标人须具备电子与智能化工程专业承包二级及以上资质，并具备安全生产许可证，不接受未按招标文件提供资格材料的投标。',
    '保留签章回执与文件哈希校验码，作为电子档案不可篡改存证。',
  ],
}

export const FALLBACK_DEVICES: DeviceRow[] = [
  {
    id: 'dev-01',
    device_code: 'DEV-FIRE-MZ-01',
    device_name: '门诊大厅智能烟感探测器01',
    system_type: 'FIRE_PROTECTION',
    building_zone: '门诊楼',
    floor_room: '1F 大厅中庭',
    ip_address: '10.20.10.11',
    status: 'ALARMING',
    last_metric_value: 12.0,
  },
  {
    id: 'dev-02',
    device_code: 'DEV-CCTV-MZ-02',
    device_name: '门诊挂号大厅高清全景球机',
    system_type: 'VIDEO_SURVEILLANCE',
    building_zone: '门诊楼',
    floor_room: '1F 挂号收费处',
    ip_address: '10.20.10.22',
    status: 'ONLINE',
    last_metric_value: null,
  },
  {
    id: 'dev-03',
    device_code: 'DEV-SOS-JZ-03',
    device_name: '急诊抢救室一键紧急求助按钮',
    system_type: 'EMERGENCY_ALARM',
    building_zone: '急救中心',
    floor_room: '1F 抢救室01',
    ip_address: '10.20.20.31',
    status: 'ONLINE',
    last_metric_value: null,
  },
  {
    id: 'dev-04',
    device_code: 'DEV-DOOR-ICU-04',
    device_name: '重症医学科(ICU)防尾随双向门禁',
    system_type: 'ACCESS_CONTROL',
    building_zone: '住院部A座',
    floor_room: '3F ICU主入口',
    ip_address: '10.20.30.41',
    status: 'ONLINE',
    last_metric_value: null,
  },
  {
    id: 'dev-05',
    device_code: 'DEV-WATER-ZY-05',
    device_name: '住院部消火栓末端试水压力传感器',
    system_type: 'FIRE_PROTECTION',
    building_zone: '住院部A座',
    floor_room: '12F 消防通道',
    ip_address: '10.20.30.55',
    status: 'ALARMING',
    last_metric_value: 0.28,
  },
  {
    id: 'dev-06',
    device_code: 'DEV-RFID-YG-06',
    device_name: '高压氧舱防爆巡更打卡点',
    system_type: 'ELECTRONIC_PATROL',
    building_zone: '医技综合楼',
    floor_room: 'B1F 氧舱机房',
    ip_address: null,
    status: 'ONLINE',
    last_metric_value: null,
  },
  {
    id: 'dev-07',
    device_code: 'DEV-CCTV-ZY-07',
    device_name: '住院部A座3F ICU走廊球机',
    system_type: 'VIDEO_SURVEILLANCE',
    building_zone: '住院部A座',
    floor_room: '3F ICU走廊',
    ip_address: '10.20.30.22',
    status: 'ONLINE',
    last_metric_value: null,
  },
  {
    id: 'dev-08',
    device_code: 'DEV-CCTV-JZ-08',
    device_name: '急救中心救护车通道枪机',
    system_type: 'VIDEO_SURVEILLANCE',
    building_zone: '急救中心',
    floor_room: '1F 救护车通道',
    ip_address: '10.20.20.22',
    status: 'ALARMING',
    last_metric_value: null,
  },
  {
    id: 'dev-09',
    device_code: 'DEV-ELEC-MZ-09',
    device_name: '门诊电气火灾剩余电流监测',
    system_type: 'FIRE_PROTECTION',
    building_zone: '门诊楼',
    floor_room: 'B1F 配电间',
    ip_address: '10.20.10.61',
    status: 'ONLINE',
    last_metric_value: 186.0,
  },
  {
    id: 'dev-10',
    device_code: 'DEV-LEAK-YG-10',
    device_name: '高压氧舱水浸探测器',
    system_type: 'FIRE_PROTECTION',
    building_zone: '高压氧舱',
    floor_room: 'B1F 机房地沟',
    ip_address: '10.20.40.12',
    status: 'FAULT',
    last_metric_value: 0.0,
  },
  {
    id: 'dev-11',
    device_code: 'DEV-SOS-NS-11',
    device_name: '住院部7F护士站一键求助',
    system_type: 'EMERGENCY_ALARM',
    building_zone: '住院部A座',
    floor_room: '7F 护士站',
    ip_address: '10.20.30.71',
    status: 'ONLINE',
    last_metric_value: null,
  },
  {
    id: 'dev-12',
    device_code: 'DEV-DOOR-DMP-12',
    device_name: '毒麻药品库双人双锁门禁',
    system_type: 'ACCESS_CONTROL',
    building_zone: '医技综合楼',
    floor_room: '2F 药库',
    ip_address: '10.20.40.41',
    status: 'ALARMING',
    last_metric_value: null,
  },
  {
    id: 'dev-13',
    device_code: 'DEV-DOOR-OR-13',
    device_name: '手术室限制区通道闸',
    system_type: 'ACCESS_CONTROL',
    building_zone: '住院部A座',
    floor_room: '5F 手术室',
    ip_address: '10.20.30.51',
    status: 'ONLINE',
    last_metric_value: null,
  },
  {
    id: 'dev-14',
    device_code: 'DEV-RFID-MZ-14',
    device_name: '门诊大厅夜间动火巡更点',
    system_type: 'ELECTRONIC_PATROL',
    building_zone: '门诊楼',
    floor_room: '1F 大厅中庭',
    ip_address: null,
    status: 'ONLINE',
    last_metric_value: null,
  },
  {
    id: 'dev-15',
    device_code: 'DEV-RFID-OR-15',
    device_name: '手术室消防通道巡更点',
    system_type: 'ELECTRONIC_PATROL',
    building_zone: '住院部A座',
    floor_room: '5F 手术室消防通道',
    ip_address: null,
    status: 'ONLINE',
    last_metric_value: null,
  },
]

export const FALLBACK_ALARMS: AlarmRow[] = [
  {
    id: 'alm-01',
    alarm_no: 'ALM20260814-001',
    system_type: 'FIRE_PROTECTION',
    device_id: 'dev-01',
    device_name: '门诊大厅智能烟感探测器01',
    building_zone: '门诊楼',
    floor_room: '1F 大厅中庭',
    alarm_type: 'FIRE_SMOKE',
    severity: 'CRITICAL',
    linkage_action_executed:
      '【联动执行】球机 DEV-CCTV-MZ-02 调至预置位01抓拍 + 门禁 DEV-DOOR-ICU-04 释放 + 广播切入疏散模式',
    snapshot_url: 'https://26-xj-fire-bid-assets.softwarelink.net/snapshots/fire_mz_01.jpg',
    handler_name: '买合木提·艾力',
    status: 'PROCESSING',
    created_at: '2026-08-14 09:12:00',
  },
  {
    id: 'alm-02',
    alarm_no: 'ALM20260814-002',
    system_type: 'EMERGENCY_ALARM',
    device_id: 'dev-03',
    device_name: '急诊抢救室一键紧急求助按钮',
    building_zone: '急救中心',
    floor_room: '1F 抢救室01',
    alarm_type: 'SOS_HELP',
    severity: 'EMERGENCY',
    linkage_action_executed: '【联动执行】安防大屏声光弹窗 + 推送就近巡逻人员（张建安）1分钟内赶赴现场',
    snapshot_url: 'https://26-xj-fire-bid-assets.softwarelink.net/snapshots/sos_jz_02.jpg',
    handler_name: '张建安',
    status: 'VERIFIED_CLOSED',
    created_at: '2026-08-14 10:05:00',
    resolved_at: '2026-08-14 10:06:12',
  },
  {
    id: 'alm-03',
    alarm_no: 'ALM20260818-003',
    system_type: 'FIRE_PROTECTION',
    device_id: 'dev-05',
    device_name: '住院部消火栓末端试水压力传感器',
    building_zone: '住院部A座',
    floor_room: '12F 消防通道',
    alarm_type: 'HYDRANT_LOW_PRESSURE',
    severity: 'WARNING',
    linkage_action_executed: '【联动执行】推送消防保卫科复核水压 + 球机 DEV-CCTV-ZY-07 预置位抓拍',
    snapshot_url: 'https://26-xj-fire-bid-assets.softwarelink.net/snapshots/hydrant_12f.jpg',
    status: 'PENDING',
    created_at: '2026-08-18 08:40:00',
  },
  {
    id: 'alm-04',
    alarm_no: 'ALM20260818-004',
    system_type: 'ACCESS_CONTROL',
    device_id: 'dev-12',
    device_name: '毒麻药品库双人双锁门禁',
    building_zone: '医技综合楼',
    floor_room: '2F 药库',
    alarm_type: 'DOOR_FORCED_OPEN',
    severity: 'CRITICAL',
    linkage_action_executed: '【联动执行】防尾随复核 + 邻近球机轮巡 + 值班长弹窗',
    snapshot_url: 'https://26-xj-fire-bid-assets.softwarelink.net/snapshots/door_dmp.jpg',
    status: 'PENDING',
    created_at: '2026-08-18 11:18:00',
  },
  {
    id: 'alm-05',
    alarm_no: 'ALM20260818-005',
    system_type: 'ELECTRONIC_PATROL',
    device_id: 'dev-15',
    device_name: '手术室消防通道巡更点',
    building_zone: '住院部A座',
    floor_room: '5F 手术室消防通道',
    alarm_type: 'PASSAGE_BLOCKED',
    severity: 'WARNING',
    linkage_action_executed: '【联动执行】AI 通道占用抓拍工单 + 隐患 SLA 黄牌',
    snapshot_url: 'https://26-xj-fire-bid-assets.softwarelink.net/snapshots/passage_or.jpg',
    handler_name: '张建安',
    status: 'PROCESSING',
    created_at: '2026-08-18 14:06:00',
  },
]

export const FALLBACK_PATROL: PatrolRow[] = [
  {
    id: 'ptl-01',
    task_no: 'TSK-2026081401',
    guard_id: 'u-03',
    guard_name: '张建安',
    route_name: '夜间重点区域消防巡查线',
    checkpoint_name: '医技综合楼B1F氧舱机房',
    checkpoint_rfid: 'RFID-YNOU-B1-01',
    plan_time: '2026-08-14 02:00:00',
    actual_time: '2026-08-14 02:04:15',
    check_status: 'NORMAL',
  },
  {
    id: 'ptl-02',
    task_no: 'TSK-2026081401',
    guard_id: 'u-03',
    guard_name: '张建安',
    route_name: '夜间重点区域消防巡查线',
    checkpoint_name: '住院部12F消火栓末端试水点',
    checkpoint_rfid: 'RFID-YNOU-12F-08',
    plan_time: '2026-08-14 02:30:00',
    actual_time: '2026-08-14 02:32:10',
    check_status: 'NORMAL',
  },
  {
    id: 'ptl-03',
    task_no: 'TSK-2026081801',
    guard_id: 'u-03',
    guard_name: '张建安',
    route_name: 'ICU及手术室重点巡查线',
    checkpoint_name: '住院部A座5F手术室消防通道',
    checkpoint_rfid: 'RFID-YNOU-5F-OR',
    plan_time: '2026-08-18 14:00:00',
    actual_time: '2026-08-18 14:06:40',
    check_status: 'DEFECT_FOUND',
    defect_description: '消防通道堆放医用推车，通道净宽不足，已拍照上报隐患工单',
  },
  {
    id: 'ptl-04',
    task_no: 'TSK-2026081801',
    guard_id: 'u-03',
    guard_name: '张建安',
    route_name: 'ICU及手术室重点巡查线',
    checkpoint_name: '住院部A座3F ICU主入口',
    checkpoint_rfid: 'RFID-YNOU-3F-ICU',
    plan_time: '2026-08-18 14:20:00',
    actual_time: null,
    check_status: 'TIMEOUT',
  },
  {
    id: 'ptl-05',
    task_no: 'TSK-2026081802',
    guard_id: 'u-03',
    guard_name: '张建安',
    route_name: '夜间门诊消防动火巡更线',
    checkpoint_name: '门诊楼B1F配电间',
    checkpoint_rfid: 'RFID-YNOU-MZ-B1',
    plan_time: '2026-08-18 02:10:00',
    actual_time: null,
    check_status: 'MISSED',
  },
]

export const CAMPUS_LAYOUT = [
  { name: '门诊楼', left: '18%', top: '28%' },
  { name: '急救中心', left: '42%', top: '18%' },
  { name: '住院部A座', left: '68%', top: '30%' },
  { name: '医技综合楼', left: '38%', top: '58%' },
  { name: '高压氧舱', left: '62%', top: '72%' },
]

export const TREND_SERIES = [
  { d: '00:00', fire: 1, sos: 0, access: 0, patrol: 0 },
  { d: '04:00', fire: 0, sos: 1, access: 0, patrol: 1 },
  { d: '08:00', fire: 2, sos: 1, access: 1, patrol: 0 },
  { d: '12:00', fire: 1, sos: 2, access: 0, patrol: 1 },
  { d: '16:00', fire: 3, sos: 1, access: 2, patrol: 1 },
  { d: '20:00', fire: 1, sos: 0, access: 1, patrol: 2 },
  { d: '24:00', fire: 0, sos: 1, access: 0, patrol: 1 },
]

export const RADAR_KPI = [
  { name: '视频监控', value: 94 },
  { name: '智慧消防', value: 86 },
  { name: '紧急求助', value: 91 },
  { name: '门禁一卡通', value: 88 },
  { name: '电子巡更', value: 79 },
]
