<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { fetchDevices } from '@/composables/useApi'
import type { Device } from '@/types'
import { SYSTEM_LABELS } from '@/types'
import PageHeader from '@/components/layout/PageHeader.vue'

const tabs = [
  { key: 'VIDEO_SURVEILLANCE', label: '视频监控' },
  { key: 'FIRE_PROTECTION', label: '智慧消防' },
  { key: 'EMERGENCY_ALARM', label: '紧急求助' },
  { key: 'ACCESS_CONTROL', label: '门禁一卡通' },
  { key: 'ELECTRONIC_PATROL', label: '电子巡更' },
]

const active = ref('VIDEO_SURVEILLANCE')
const devices = ref<Device[]>([])
const filtered = computed(() => devices.value.filter((d) => d.system_type === active.value))

const statusClass: Record<string, string> = {
  ONLINE: 'badge-green',
  ALARMING: 'badge-red',
  FAULT: 'badge-yellow',
  OFFLINE: 'badge-blue',
}

onMounted(async () => {
  const res = await fetchDevices()
  devices.value = res.data
})
</script>

<template>
  <div>
    <PageHeader title="五大子系统全景联动工作台" subtitle="视频 / 消防 / 求助 / 门禁 / 巡更 设备状态矩阵与实时传感指标" />
    <div class="mb-4 flex flex-wrap gap-2">
      <button
        v-for="t in tabs"
        :key="t.key"
        class="rounded-full border px-3 py-1.5 text-xs"
        :class="active === t.key ? 'border-rose-400 bg-rose-600/20 text-rose-100' : 'border-rose-950 text-slate-400'"
        @click="active = t.key"
      >
        {{ t.label }}
      </button>
    </div>
    <div class="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      <article v-for="d in filtered" :key="d.id" class="panel p-4">
        <div class="flex items-start justify-between gap-2">
          <div>
            <p class="text-sm font-medium text-slate-100">{{ d.device_name }}</p>
            <p class="font-mono text-[11px] text-rose-300">{{ d.device_code }}</p>
          </div>
          <span :class="statusClass[d.status] || 'badge-blue'">{{ d.status }}</span>
        </div>
        <p class="mt-3 text-xs text-slate-400">{{ d.building_zone }} · {{ d.floor_room }}</p>
        <p class="mt-1 text-xs text-slate-500">{{ SYSTEM_LABELS[d.system_type] }} · {{ d.ip_address || 'RFID/BLE' }}</p>
        <p v-if="d.last_metric_value != null" class="mt-2 font-mono text-lg text-rose-200">{{ d.last_metric_value }}</p>
        <p v-if="active === 'VIDEO_SURVEILLANCE'" class="mt-3 rounded bg-ink-950 p-3 text-[11px] text-slate-500">
          PTZ 预置位 01 / 02 / 03 · 录像调阅通道就绪（演示）
        </p>
      </article>
    </div>
  </div>
</template>
