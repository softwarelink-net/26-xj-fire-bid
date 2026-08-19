<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { checkinPatrol, fetchPatrolLogs } from '@/composables/useApi'
import type { PatrolLog } from '@/types'
import PageHeader from '@/components/layout/PageHeader.vue'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const logs = ref<PatrolLog[]>([])
const stats = ref({ normal: 0, defect: 0, missed: 0, timeout: 0 })
const msg = ref('')
const defect = ref('')

async function load() {
  const res = await fetchPatrolLogs()
  logs.value = res.data
  stats.value = res.stats
}

onMounted(load)

async function checkin(row: PatrolLog, status: string) {
  msg.value = ''
  await checkinPatrol({
    id: row.id,
    checkpoint_rfid: row.checkpoint_rfid,
    check_status: status,
    defect_description: status === 'DEFECT_FOUND' ? defect.value || '现场隐患已拍照上报' : null,
  })
  msg.value = `${row.checkpoint_name} 已打卡（${status}）`
  await load()
}

const stClass: Record<string, string> = {
  NORMAL: 'badge-green',
  DEFECT_FOUND: 'badge-yellow',
  MISSED: 'badge-red',
  TIMEOUT: 'badge-red',
}
</script>

<template>
  <div class="space-y-4">
    <PageHeader title="电子巡更与隐患闭环" subtitle="RFID/蓝牙点位核验 · 漏检超时报警 · 通道占用隐患工单" />
    <div class="grid gap-3 sm:grid-cols-4">
      <div class="panel p-4"><p class="label-muted">正常</p><p class="stat-value text-emerald-300">{{ stats.normal }}</p></div>
      <div class="panel p-4"><p class="label-muted">隐患</p><p class="stat-value text-amber-300">{{ stats.defect }}</p></div>
      <div class="panel p-4"><p class="label-muted">漏检</p><p class="stat-value">{{ stats.missed }}</p></div>
      <div class="panel p-4"><p class="label-muted">超时</p><p class="stat-value">{{ stats.timeout }}</p></div>
    </div>
    <p v-if="msg" class="text-xs text-emerald-300">{{ msg }}</p>
    <label v-if="auth.hasRole(['ROLE_PATROL_GUARD'])" class="block text-xs text-slate-400">
      隐患描述
      <input v-model="defect" class="input-dark" placeholder="通道堵塞 / 设备损坏 / 动火作业未报备…" />
    </label>
    <ol class="relative space-y-3 border-l border-rose-900 pl-6">
      <li v-for="row in logs" :key="row.id" class="panel p-4">
        <div class="flex flex-wrap items-start justify-between gap-2">
          <div>
            <p class="text-sm font-medium">{{ row.checkpoint_name }}</p>
            <p class="text-xs text-slate-500">{{ row.route_name }} · {{ row.checkpoint_rfid }}</p>
            <p class="mt-1 text-xs text-slate-400">计划 {{ row.plan_time }} · 实际 {{ row.actual_time || '未打卡' }}</p>
            <p v-if="row.defect_description" class="mt-2 text-xs text-amber-200">{{ row.defect_description }}</p>
          </div>
          <span :class="stClass[row.check_status]">{{ row.check_status }}</span>
        </div>
        <div v-if="auth.hasRole(['ROLE_PATROL_GUARD'])" class="mt-3 flex gap-2">
          <button class="btn-primary !py-1 text-xs" @click="checkin(row, 'NORMAL')">扫码打卡</button>
          <button class="btn-ghost !py-1 text-xs" @click="checkin(row, 'DEFECT_FOUND')">上报隐患</button>
        </div>
      </li>
    </ol>
  </div>
</template>
