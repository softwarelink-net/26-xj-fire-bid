import type { AuthUser } from '@/types'

export const DEMO_USERS: Array<AuthUser & { password: string }> = [
  {
    id: 'u-01',
    username: 'admin',
    password: 'Admin@2026',
    full_name: '系统超级管理员',
    department: '保卫处监控中心',
    role: 'ROLE_SUPER_ADMIN',
    phone: '0991-4362391',
    badge_no: 'XJ-ADMIN-01',
  },
  {
    id: 'u-02',
    username: 'dispatcher',
    password: 'Dispatch@2026',
    full_name: '买合木提·艾力',
    department: '消防保卫监控中心',
    role: 'ROLE_SECURITY_DISPATCHER',
    phone: '0991-4362392',
    badge_no: 'XJ-DISP-08',
  },
  {
    id: 'u-03',
    username: 'guard',
    password: 'Guard@2026',
    full_name: '张建安',
    department: '保卫处巡更机动队',
    role: 'ROLE_PATROL_GUARD',
    phone: '13909918801',
    badge_no: 'XJ-GUARD-22',
  },
  {
    id: 'u-04',
    username: 'leader',
    password: 'Leader@2026',
    full_name: '李副院长',
    department: '新疆医科大学第一附属医院院领导',
    role: 'ROLE_DECISION_MAKER',
    phone: '0991-4362300',
    badge_no: 'XJ-LEAD-01',
  },
]
