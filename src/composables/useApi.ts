import { DEMO_USERS } from '@/constants/accounts'
import { mockApi } from '@/composables/fallback'
import type { Alarm, AuthUser, Device, PatrolLog, SystemConfig } from '@/types'

export { DEMO_USERS }

const TOKEN_KEY = 'xjfire_token'

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem(TOKEN_KEY) || ''
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(init.headers as Record<string, string> | undefined),
  }
  if (token) headers.Authorization = `Bearer ${token}`
  try {
    const res = await fetch(path, { ...init, headers })
    const data = (await res.json().catch(() => ({}))) as T & { success?: boolean; error?: string }
    if (!res.ok || (data && data.success === false)) {
      if (res.status === 404 || data.error === 'Not Found') {
        return mockApi(path, init) as T
      }
      throw new Error(data.error || `请求失败 (${res.status})`)
    }
    return data
  } catch (err) {
    if (err instanceof Error && err.message && !err.message.includes('请求失败') && err.message !== '账号或密码错误') {
      try {
        return mockApi(path, init) as T
      } catch {
        throw err
      }
    }
    throw err
  }
}

export async function loginApi(username: string, password: string) {
  return request<{ success: boolean; token: string; user: AuthUser }>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  })
}

export async function fetchDevices(params: Record<string, string> = {}) {
  const q = new URLSearchParams()
  Object.entries(params).forEach(([k, v]) => {
    if (v) q.set(k, v)
  })
  return request<{ success: boolean; data: Device[]; total: number }>(`/api/devices?${q.toString()}`)
}

export async function fetchAlarms(params: Record<string, string> = {}) {
  const q = new URLSearchParams()
  Object.entries(params).forEach(([k, v]) => {
    if (v) q.set(k, v)
  })
  return request<{ success: boolean; data: Alarm[]; total: number; masking: boolean }>(`/api/alarms?${q.toString()}`)
}

export async function acknowledgeAlarm(id: string, payload: Record<string, unknown> = {}) {
  return request<{ success: boolean; data: Record<string, unknown> }>(`/api/alarms/${id}/acknowledge`, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function fetchPatrolLogs() {
  return request<{
    success: boolean
    data: PatrolLog[]
    total: number
    stats: { normal: number; defect: number; missed: number; timeout: number }
  }>('/api/patrol/logs')
}

export async function checkinPatrol(payload: Record<string, unknown>) {
  return request<{ success: boolean; data: Record<string, unknown> }>('/api/patrol/checkin', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function fetchDashboard() {
  return request<{ success: boolean; data: Record<string, unknown> }>('/api/dashboard/stats')
}

export async function fetchConfigs() {
  return request<{ success: boolean; data: SystemConfig[] }>('/api/system/configs')
}

export async function updateConfig(config_key: string, config_value: string) {
  return request<{ success: boolean }>('/api/system/configs', {
    method: 'PATCH',
    body: JSON.stringify({ config_key, config_value }),
  })
}

export async function fetchAudit() {
  return request<{ success: boolean; data: Array<Record<string, unknown>> }>('/api/audit')
}

export async function fetchTender() {
  return request<{ success: boolean; data: Record<string, unknown> }>('/api/tender')
}
