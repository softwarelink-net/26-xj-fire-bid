import { DEMO_USERS } from '@/constants/accounts'
import type { Alarm, AuthUser, Device, PatrolLog, SystemConfig } from '@/types'

const DEVICES: Device[] = [
  { id: 'dev-01', device_code: 'DEV-FIRE-MZ-01', device_name: '门诊大厅智能烟感探测器01', system_type: 'FIRE_PROTECTION', building_zone: '门诊楼', floor_room: '1F 大厅中庭', ip_address: '10.20.10.11', status: 'ALARMING', last_metric_value: 12 },
  { id: 'dev-02', device_code: 'DEV-CCTV-MZ-02', device_name: '门诊挂号大厅高清全景球机', system_type: 'VIDEO_SURVEILLANCE', building_zone: '门诊楼', floor_room: '1F 挂号收费处', ip_address: '10.20.10.22', status: 'ONLINE' },
  { id: 'dev-03', device_code: 'DEV-SOS-JZ-03', device_name: '急诊抢救室一键紧急求助按钮', system_type: 'EMERGENCY_ALARM', building_zone: '急救中心', floor_room: '1F 抢救室01', ip_address: '10.20.20.31', status: 'ONLINE' },
  { id: 'dev-04', device_code: 'DEV-DOOR-ICU-04', device_name: '重症医学科(ICU)防尾随双向门禁', system_type: 'ACCESS_CONTROL', building_zone: '住院部A座', floor_room: '3F ICU主入口', ip_address: '10.20.30.41', status: 'ONLINE' },
  { id: 'dev-05', device_code: 'DEV-WATER-ZY-05', device_name: '住院部消火栓末端试水压力传感器', system_type: 'FIRE_PROTECTION', building_zone: '住院部A座', floor_room: '12F 消防通道', ip_address: '10.20.30.55', status: 'ALARMING', last_metric_value: 0.28 },
  { id: 'dev-06', device_code: 'DEV-RFID-YG-06', device_name: '高压氧舱防爆巡更打卡点', system_type: 'ELECTRONIC_PATROL', building_zone: '医技综合楼', floor_room: 'B1F 氧舱机房', status: 'ONLINE' },
  { id: 'dev-07', device_code: 'DEV-CCTV-ZY-07', device_name: '住院部A座3F ICU走廊球机', system_type: 'VIDEO_SURVEILLANCE', building_zone: '住院部A座', floor_room: '3F ICU走廊', ip_address: '10.20.30.22', status: 'ONLINE' },
  { id: 'dev-08', device_code: 'DEV-CCTV-JZ-08', device_name: '急救中心救护车通道枪机', system_type: 'VIDEO_SURVEILLANCE', building_zone: '急救中心', floor_room: '1F 救护车通道', ip_address: '10.20.20.22', status: 'ALARMING' },
  { id: 'dev-09', device_code: 'DEV-ELEC-MZ-09', device_name: '门诊电气火灾剩余电流监测', system_type: 'FIRE_PROTECTION', building_zone: '门诊楼', floor_room: 'B1F 配电间', ip_address: '10.20.10.61', status: 'ONLINE', last_metric_value: 186 },
  { id: 'dev-10', device_code: 'DEV-LEAK-YG-10', device_name: '高压氧舱水浸探测器', system_type: 'FIRE_PROTECTION', building_zone: '高压氧舱', floor_room: 'B1F 机房地沟', ip_address: '10.20.40.12', status: 'FAULT', last_metric_value: 0 },
  { id: 'dev-11', device_code: 'DEV-SOS-NS-11', device_name: '住院部7F护士站一键求助', system_type: 'EMERGENCY_ALARM', building_zone: '住院部A座', floor_room: '7F 护士站', ip_address: '10.20.30.71', status: 'ONLINE' },
  { id: 'dev-12', device_code: 'DEV-DOOR-DMP-12', device_name: '毒麻药品库双人双锁门禁', system_type: 'ACCESS_CONTROL', building_zone: '医技综合楼', floor_room: '2F 药库', ip_address: '10.20.40.41', status: 'ALARMING' },
  { id: 'dev-13', device_code: 'DEV-DOOR-OR-13', device_name: '手术室限制区通道闸', system_type: 'ACCESS_CONTROL', building_zone: '住院部A座', floor_room: '5F 手术室', ip_address: '10.20.30.51', status: 'ONLINE' },
  { id: 'dev-14', device_code: 'DEV-RFID-MZ-14', device_name: '门诊大厅夜间动火巡更点', system_type: 'ELECTRONIC_PATROL', building_zone: '门诊楼', floor_room: '1F 大厅中庭', status: 'ONLINE' },
  { id: 'dev-15', device_code: 'DEV-RFID-OR-15', device_name: '手术室消防通道巡更点', system_type: 'ELECTRONIC_PATROL', building_zone: '住院部A座', floor_room: '5F 手术室消防通道', status: 'ONLINE' },
]

const ALARMS: Alarm[] = [
  { id: 'alm-01', alarm_no: 'ALM20260814-001', system_type: 'FIRE_PROTECTION', device_id: 'dev-01', device_name: '门诊大厅智能烟感探测器01', building_zone: '门诊楼', floor_room: '1F 大厅中庭', alarm_type: 'FIRE_SMOKE', severity: 'CRITICAL', linkage_action_executed: '【联动执行】球机 DEV-CCTV-MZ-02 调至预置位01抓拍 + 门禁释放 + 广播疏散', snapshot_url: 'https://26-xj-fire-bid-assets.softwarelink.net/snapshots/fire_mz_01.jpg', handler_name: '买合木提·艾力', status: 'PROCESSING', created_at: '2026-08-14 09:12:00' },
  { id: 'alm-02', alarm_no: 'ALM20260814-002', system_type: 'EMERGENCY_ALARM', device_id: 'dev-03', device_name: '急诊抢救室一键紧急求助按钮', building_zone: '急救中心', floor_room: '1F 抢救室01', alarm_type: 'SOS_HELP', severity: 'EMERGENCY', linkage_action_executed: '【联动执行】声光弹窗 + 就近安保 1 分钟到达', snapshot_url: 'https://26-xj-fire-bid-assets.softwarelink.net/snapshots/sos_jz_02.jpg', handler_name: '张建安', status: 'VERIFIED_CLOSED', created_at: '2026-08-14 10:05:00' },
  { id: 'alm-03', alarm_no: 'ALM20260818-003', system_type: 'FIRE_PROTECTION', device_id: 'dev-05', device_name: '住院部消火栓末端试水压力传感器', building_zone: '住院部A座', floor_room: '12F 消防通道', alarm_type: 'HYDRANT_LOW_PRESSURE', severity: 'WARNING', linkage_action_executed: '【联动执行】复核水压 + 球机抓拍', status: 'PENDING', created_at: '2026-08-18 08:40:00' },
  { id: 'alm-04', alarm_no: 'ALM20260818-004', system_type: 'ACCESS_CONTROL', device_id: 'dev-12', device_name: '毒麻药品库双人双锁门禁', building_zone: '医技综合楼', floor_room: '2F 药库', alarm_type: 'DOOR_FORCED_OPEN', severity: 'CRITICAL', linkage_action_executed: '【联动执行】防尾随复核 + 球机轮巡', status: 'PENDING', created_at: '2026-08-18 11:18:00' },
  { id: 'alm-05', alarm_no: 'ALM20260818-005', system_type: 'ELECTRONIC_PATROL', device_id: 'dev-15', device_name: '手术室消防通道巡更点', building_zone: '住院部A座', floor_room: '5F 手术室消防通道', alarm_type: 'PASSAGE_BLOCKED', severity: 'WARNING', linkage_action_executed: '【联动执行】AI 通道占用抓拍工单', handler_name: '张建安', status: 'PROCESSING', created_at: '2026-08-18 14:06:00' },
]

const PATROL: PatrolLog[] = [
  { id: 'ptl-01', task_no: 'TSK-2026081401', guard_id: 'u-03', guard_name: '张建安', route_name: '夜间重点区域消防巡查线', checkpoint_name: '医技综合楼B1F氧舱机房', checkpoint_rfid: 'RFID-YNOU-B1-01', plan_time: '2026-08-14 02:00:00', actual_time: '2026-08-14 02:04:15', check_status: 'NORMAL' },
  { id: 'ptl-02', task_no: 'TSK-2026081401', guard_id: 'u-03', guard_name: '张建安', route_name: '夜间重点区域消防巡查线', checkpoint_name: '住院部12F消火栓末端试水点', checkpoint_rfid: 'RFID-YNOU-12F-08', plan_time: '2026-08-14 02:30:00', actual_time: '2026-08-14 02:32:10', check_status: 'NORMAL' },
  { id: 'ptl-03', task_no: 'TSK-2026081801', guard_id: 'u-03', guard_name: '张建安', route_name: 'ICU及手术室重点巡查线', checkpoint_name: '住院部A座5F手术室消防通道', checkpoint_rfid: 'RFID-YNOU-5F-OR', plan_time: '2026-08-18 14:00:00', actual_time: '2026-08-18 14:06:40', check_status: 'DEFECT_FOUND', defect_description: '消防通道堆放医用推车，通道净宽不足' },
  { id: 'ptl-04', task_no: 'TSK-2026081801', guard_id: 'u-03', guard_name: '张建安', route_name: 'ICU及手术室重点巡查线', checkpoint_name: '住院部A座3F ICU主入口', checkpoint_rfid: 'RFID-YNOU-3F-ICU', plan_time: '2026-08-18 14:20:00', check_status: 'TIMEOUT' },
  { id: 'ptl-05', task_no: 'TSK-2026081802', guard_id: 'u-03', guard_name: '张建安', route_name: '夜间门诊消防动火巡更线', checkpoint_name: '门诊楼B1F配电间', checkpoint_rfid: 'RFID-YNOU-MZ-B1', plan_time: '2026-08-18 02:10:00', check_status: 'MISSED' },
]

/** UTF-8 安全 Base64，避免中文姓名/部门触发 btoa Latin1 报错 */
function utf8ToBase64(str: string) {
  const bytes = new TextEncoder().encode(str)
  let bin = ''
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]!)
  return btoa(bin)
}

function signLocalJwt(user: AuthUser) {
  const h = utf8ToBase64(JSON.stringify({ alg: 'none', typ: 'JWT' })).replace(/=/g, '')
  const p = utf8ToBase64(JSON.stringify({ ...user, exp: Date.now() + 8 * 3600 * 1000 })).replace(/=/g, '')
  return `${h}.${p}.demo`
}

export function mockApi(path: string, init: RequestInit = {}) {
  const method = (init.method || 'GET').toUpperCase()
  const url = new URL(path, 'https://26-xj-fire-bid.softwarelink.net')

  if (url.pathname === '/api/auth/login' && method === 'POST') {
    const body = JSON.parse(String(init.body || '{}')) as { username?: string; password?: string }
    const hit = DEMO_USERS.find((u) => u.username === body.username && u.password === body.password)
    if (!hit) throw new Error('账号或密码错误')
    const { password: _p, ...user } = hit
    return { success: true, token: signLocalJwt(user), user }
  }
  if (url.pathname === '/api/tender') {
    return {
      success: true,
      data: {
        title: '新疆医科大学第一附属医院智慧消防系统等5项采购项目公开招标公告',
        issuer: '新疆医科大学第一附属医院',
        project_no: 'XZJ266-100（3）-ZK',
        publish_time: '2026-08-13 19:01',
        keywords: '新疆医科大学第一附属医院, 智慧消防系统, 视频监控系统, 门禁一卡通, 弱电智能化, XZJ266-100（3）-ZK, 医院安防采购, 新疆政府采购',
        summary: '新疆医科大学第一附属医院公开招标智慧消防系统等5项采购项目，预算金额922,215.12元，包含视频监控、入侵报警及紧急求助、门禁及一卡通、电子巡更、智慧消防各1套。投标截止2026年9月4日16:00。',
        budget: 922215.12,
        deadline: '2026-09-04 16:00:00',
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
          '投标人须具备电子与智能化工程专业承包二级及以上资质，并具备安全生产许可证。',
          '保留签章回执与文件哈希校验码，作为电子档案不可篡改存证。',
        ],
      },
    }
  }
  if (url.pathname === '/api/devices') {
    const type = url.searchParams.get('system_type') || ''
    const data = type ? DEVICES.filter((d) => d.system_type === type) : DEVICES
    return { success: true, data, total: data.length }
  }
  if (url.pathname === '/api/alarms') {
    return { success: true, data: ALARMS, total: ALARMS.length, masking: true }
  }
  if (url.pathname.match(/^\/api\/alarms\/.+\/acknowledge$/) && method === 'POST') {
    return { success: true, data: { status: 'PROCESSING', linkage: '【联动执行】球机抓拍 + 门禁释放 + 广播疏散', dispatched: '张建安', sla_seconds: 60 } }
  }
  if (url.pathname === '/api/patrol/logs') {
    const stats = {
      normal: PATROL.filter((p) => p.check_status === 'NORMAL').length,
      defect: PATROL.filter((p) => p.check_status === 'DEFECT_FOUND').length,
      missed: PATROL.filter((p) => p.check_status === 'MISSED').length,
      timeout: PATROL.filter((p) => p.check_status === 'TIMEOUT').length,
    }
    return { success: true, data: PATROL, total: PATROL.length, stats }
  }
  if (url.pathname === '/api/patrol/checkin' && method === 'POST') {
    return { success: true, data: { check_status: 'NORMAL', actual_time: new Date().toISOString().slice(0, 19).replace('T', ' ') } }
  }
  if (url.pathname === '/api/dashboard/stats') {
    return {
      success: true,
      data: {
        kpis: { devices: DEVICES.length, online: DEVICES.filter((d) => d.status === 'ONLINE').length, health: 80, fireAlarms: 1, sos: 0, pending: 3, patrolOnline: 12, slaHit: 96, defects: 3 },
        heatmap: [
          { name: '门诊楼', left: '18%', top: '28%', devices: 4, alarms: 1, alarming: 1, heat: 52 },
          { name: '急救中心', left: '42%', top: '18%', devices: 2, alarms: 1, alarming: 1, heat: 40 },
          { name: '住院部A座', left: '68%', top: '30%', devices: 6, alarms: 2, alarming: 1, heat: 68 },
          { name: '医技综合楼', left: '38%', top: '58%', devices: 2, alarms: 1, alarming: 1, heat: 44 },
          { name: '高压氧舱', left: '62%', top: '72%', devices: 1, alarms: 0, alarming: 1, heat: 30 },
        ],
        notices: ALARMS.map((a) => ({ id: a.id, kind: a.alarm_type, title: `${a.device_name} · ${a.floor_room}`, host: a.building_zone, time: a.created_at, status: a.status, severity: a.severity })),
        trend: [
          { d: '00:00', fire: 1, sos: 0, access: 0, patrol: 0 },
          { d: '04:00', fire: 0, sos: 1, access: 0, patrol: 1 },
          { d: '08:00', fire: 2, sos: 1, access: 1, patrol: 0 },
          { d: '12:00', fire: 1, sos: 2, access: 0, patrol: 1 },
          { d: '16:00', fire: 3, sos: 1, access: 2, patrol: 1 },
          { d: '20:00', fire: 1, sos: 0, access: 1, patrol: 2 },
        ],
        radar: [
          { name: '视频监控', value: 94 },
          { name: '智慧消防', value: 86 },
          { name: '紧急求助', value: 91 },
          { name: '门禁一卡通', value: 88 },
          { name: '电子巡更', value: 79 },
        ],
        systems: [
          { key: 'VIDEO_SURVEILLANCE', name: '视频监控', count: 3 },
          { key: 'FIRE_PROTECTION', name: '智慧消防', count: 4 },
          { key: 'EMERGENCY_ALARM', name: '紧急求助', count: 2 },
          { key: 'ACCESS_CONTROL', name: '门禁一卡通', count: 3 },
          { key: 'ELECTRONIC_PATROL', name: '电子巡更', count: 3 },
        ],
      },
    }
  }
  if (url.pathname === '/api/system/configs') {
    return {
      success: true,
      data: [
        { config_key: 'FEATURE_AUTO_CROSS_LINKAGE', config_value: 'true', category: 'FEATURE_FLAG', description: '跨系统自动联动' },
        { config_key: 'FEATURE_SM4_DATA_MASKING', config_value: 'true', category: 'SECURITY', description: '国密脱敏' },
        { config_key: 'EMERGENCY_RESPONSE_SLA_SECONDS', config_value: '60', category: 'SLA' },
      ] as SystemConfig[],
    }
  }
  if (url.pathname === '/api/audit') return { success: true, data: [] }
  throw new Error('Not Found')
}
