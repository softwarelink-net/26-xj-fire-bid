<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { acknowledgeAlarm, fetchAlarms } from '@/composables/useApi'
import type { Alarm } from '@/types'
import { ALARM_TYPE_LABELS, SYSTEM_LABELS } from '@/types'
import PageHeader from '@/components/layout/PageHeader.vue'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const alarms = ref<Alarm[]>([])
const active = ref<Alarm | null>(null)
const msg = ref('')

onMounted(async () => {
  const res = await fetchAlarms()
  alarms.value = res.data
  active.value = alarms.value.find((a) => a.status === 'PENDING' || a.status === 'PROCESSING') || alarms.value[0] || null
})

async function ack(id: string) {
  msg.value = ''
  const res = await acknowledgeAlarm(id, { result: '值班长确认', dispatch_guard: '张建安' })
  msg.value = String(res.data.linkage || '已确认')
  const list = await fetchAlarms()
  alarms.value = list.data
}

const sevClass: Record<string, string> = {
  EMERGENCY: 'badge-red alarm-pulse',
  CRITICAL: 'badge-red',
  WARNING: 'badge-yellow',
  INFO: 'badge-blue',
}
</script>

<template>
  <div class="space-y-4">
    <PageHeader title="实时报警调度与跨系统联动" subtitle="声光弹窗 · 联动编排详情 · 就近巡更安保派单" />
    <p v-if="msg" class="rounded border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-200">{{ msg }}</p>
    <div class="grid gap-4 lg:grid-cols-5">
      <div class="panel lg:col-span-2">
        <div class="panel-header">警情队列</div>
        <ul class="max-h-[560px] space-y-2 overflow-auto p-3">
          <li
            v-for="a in alarms"
            :key="a.id"
            class="cursor-pointer rounded border px-3 py-2 text-xs"
            :class="active?.id === a.id ? 'border-rose-400 bg-rose-950/40' : 'border-rose-950'"
            @click="active = a"
          >
            <div class="flex items-center justify-between">
              <span :class="sevClass[a.severity]">{{ a.severity }}</span>
              <span class="text-slate-500">{{ a.status }}</span>
            </div>
            <p class="mt-1 text-slate-200">{{ a.device_name }}</p>
            <p class="text-slate-500">{{ a.building_zone }} · {{ ALARM_TYPE_LABELS[a.alarm_type] }}</p>
          </li>
        </ul>
      </div>
      <div v-if="active" class="panel lg:col-span-3 p-5">
        <p class="font-mono text-xs text-rose-300">{{ active.alarm_no }}</p>
        <h2 class="mt-1 text-lg font-semibold">{{ active.device_name }}</h2>
        <p class="mt-1 text-sm text-slate-400">{{ active.building_zone }} · {{ active.floor_room }}</p>
        <p class="mt-3 text-sm">{{ SYSTEM_LABELS[active.system_type] }} · {{ ALARM_TYPE_LABELS[active.alarm_type] }}</p>
        <div class="mt-4 rounded border border-rose-900 bg-ink-950 p-3 text-sm leading-6 text-rose-100">
          {{ active.linkage_action_executed || '等待联动引擎执行' }}
        </div>
        <p class="mt-3 text-xs text-slate-500">处置人：{{ active.handler_name || '未派单' }}</p>
        <div class="mt-5 flex gap-3">
          <button
            class="btn-danger"
            :disabled="!auth.hasRole(['ROLE_SECURITY_DISPATCHER', 'ROLE_PATROL_GUARD', 'ROLE_SUPER_ADMIN'])"
            @click="ack(active.id)"
          >
            确认并触发联动 / 派单张建安
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
