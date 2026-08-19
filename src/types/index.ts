export type Role =
  | 'ROLE_SUPER_ADMIN'
  | 'ROLE_SECURITY_DISPATCHER'
  | 'ROLE_PATROL_GUARD'
  | 'ROLE_DECISION_MAKER'

export const ALL_ROLES: Role[] = [
  'ROLE_SUPER_ADMIN',
  'ROLE_SECURITY_DISPATCHER',
  'ROLE_PATROL_GUARD',
  'ROLE_DECISION_MAKER',
]

export const ROLE_LABELS: Record<Role, string> = {
  ROLE_SUPER_ADMIN: '保卫处系统总管',
  ROLE_SECURITY_DISPATCHER: '安防监控中心值班长',
  ROLE_PATROL_GUARD: '院区巡更安保专员',
  ROLE_DECISION_MAKER: '院领导 / 后勤保卫院长',
}

export const SYSTEM_LABELS: Record<string, string> = {
  VIDEO_SURVEILLANCE: '视频监控',
  FIRE_PROTECTION: '智慧消防',
  EMERGENCY_ALARM: '紧急求助',
  ACCESS_CONTROL: '门禁一卡通',
  ELECTRONIC_PATROL: '电子巡更',
}

export const ALARM_TYPE_LABELS: Record<string, string> = {
  FIRE_SMOKE: '烟感火警',
  HYDRANT_LOW_PRESSURE: '消火栓低压',
  SOS_HELP: '紧急求助',
  INTRUSION_ALERT: '入侵报警',
  DOOR_FORCED_OPEN: '门禁强开',
  PASSAGE_BLOCKED: '通道占用',
}

export interface AuthUser {
  id: string
  username: string
  full_name: string
  department: string
  role: Role
  phone?: string
  badge_no?: string
}

export interface Device {
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

export interface Alarm {
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

export interface PatrolLog {
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

export interface SystemConfig {
  config_key: string
  config_value: string
  category: string
  description?: string
}
