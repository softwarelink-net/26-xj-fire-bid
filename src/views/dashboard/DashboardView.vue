<script setup lang="ts">
import { computed, defineAsyncComponent, onMounted, ref } from 'vue'
import type { EChartsCoreOption } from 'echarts/core'
import { fetchDashboard } from '@/composables/useApi'
import { useAppStore } from '@/stores/app'
import { useAuthStore } from '@/stores/auth'
import PageHeader from '@/components/layout/PageHeader.vue'
import { ALARM_TYPE_LABELS } from '@/types'

const BaseChart = defineAsyncComponent(() => import('@/components/charts/BaseChart.vue'))
const app = useAppStore()
const auth = useAuthStore()
const dash = ref<Record<string, unknown> | null>(null)

const kpis = computed(() => (dash.value?.kpis || {}) as Record<string, number>)
const heatmap = computed(
  () =>
    (dash.value?.heatmap || []) as Array<{
      name: string
      left: string
      top: string
      devices: number
      alarms: number
      alarming: number
      heat: number
    }>,
)
const notices = computed(
  () =>
    (dash.value?.notices || []) as Array<{
      id: string
      kind: string
      title: string
      host: string
      time: string
      status: string
      severity: string
    }>,
)
const trend = computed(
  () => (dash.value?.trend || []) as Array<{ d: string; fire: number; sos: number; access: number; patrol: number }>,
)
const radar = computed(() => (dash.value?.radar || []) as Array<{ name: string; value: number }>)

const lineOption = computed<EChartsCoreOption>(() => ({
  backgroundColor: 'transparent',
  tooltip: { trigger: 'axis' },
  legend: { data: ['火警', 'SOS', '门禁', '巡更异常'], textStyle: { color: '#94a3b8' }, top: 0 },
  grid: { left: 40, right: 16, top: 32, bottom: 24 },
  xAxis: { type: 'category', data: trend.value.map((d) => d.d), axisLabel: { color: '#64748b' } },
  yAxis: { type: 'value', axisLabel: { color: '#64748b' }, splitLine: { lineStyle: { color: '#3f1212' } } },
  series: [
    { name: '火警', type: 'line', data: trend.value.map((d) => d.fire), smooth: true, itemStyle: { color: '#f87171' }, areaStyle: { color: 'rgba(248,113,113,0.16)' } },
    { name: 'SOS', type: 'line', data: trend.value.map((d) => d.sos), smooth: true, itemStyle: { color: '#fbbf24' } },
    { name: '门禁', type: 'line', data: trend.value.map((d) => d.access), smooth: true, itemStyle: { color: '#38bdf8' } },
    { name: '巡更异常', type: 'line', data: trend.value.map((d) => d.patrol), smooth: true, itemStyle: { color: '#a78bfa' } },
  ],
}))

const radarOption = computed<EChartsCoreOption>(() => ({
  backgroundColor: 'transparent',
  radar: {
    indicator: radar.value.map((r) => ({ name: r.name, max: 100 })),
    axisName: { color: '#94a3b8' },
    splitLine: { lineStyle: { color: '#7f1d1d' } },
    splitArea: { areaStyle: { color: ['rgba(127,29,29,0.12)', 'rgba(127,29,29,0.04)'] } },
  },
  series: [
    {
      type: 'radar',
      data: [{ value: radar.value.map((r) => r.value), name: '完好率', areaStyle: { color: 'rgba(244,63,94,0.25)' }, lineStyle: { color: '#fb7185' } }],
    },
  ],
}))

const gaugeOption = computed<EChartsCoreOption>(() => ({
  backgroundColor: 'transparent',
  series: [
    {
      type: 'gauge',
      min: 0,
      max: 100,
      startAngle: 210,
      endAngle: -30,
      progress: { show: true, width: 12, itemStyle: { color: '#34d399' } },
      axisLine: { lineStyle: { width: 12, color: [[1, '#3f1212']] } },
      axisTick: { show: false },
      splitLine: { show: false },
      axisLabel: { show: false },
      pointer: { show: false },
      title: { offsetCenter: [0, '60%'], color: '#94a3b8', fontSize: 12 },
      detail: { valueAnimation: true, formatter: '{value}%', color: '#e2e8f0', fontSize: 22, offsetCenter: [0, '10%'] },
      data: [{ value: kpis.value.slaHit || 96, name: 'SOS 响应 SLA' }],
    },
  ],
}))

onMounted(async () => {
  const res = await fetchDashboard()
  dash.value = res.data
})
</script>

<template>
  <div class="space-y-5">
    <PageHeader title="新医大一附院全景安防消防态势感知大屏" subtitle="门诊 / 住院 / 急救 / 医技三维热力 · 五大子系统健康雷达 · 24 小时警情趋势" />

    <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <div class="panel p-4">
        <p class="label-muted">火警待处置</p>
        <p class="stat-value">{{ kpis.fireAlarms ?? 0 }}</p>
      </div>
      <div class="panel p-4">
        <p class="label-muted">紧急求助</p>
        <p class="stat-value text-amber-300">{{ kpis.sos ?? 0 }}</p>
      </div>
      <div class="panel p-4">
        <p class="label-muted">设备完好率</p>
        <p class="stat-value text-emerald-300">{{ kpis.health ?? 0 }}%</p>
      </div>
      <div class="panel p-4">
        <p class="label-muted">巡更在线</p>
        <p class="stat-value text-sky-300">{{ kpis.patrolOnline ?? 12 }}</p>
      </div>
    </div>

    <div class="grid gap-4 xl:grid-cols-3">
      <div class="panel xl:col-span-2 overflow-hidden">
        <div class="panel-header">院区楼宇热力分布</div>
        <div class="relative h-[320px] bg-[radial-gradient(circle_at_center,rgba(185,28,28,0.18),transparent_62%)]">
          <div
            v-for="z in heatmap"
            :key="z.name"
            class="absolute -translate-x-1/2 -translate-y-1/2 rounded-lg border border-rose-400/30 bg-ink-900/80 px-3 py-2 text-xs shadow-lg"
            :style="{ left: z.left, top: z.top }"
          >
            <p class="font-medium text-rose-100">{{ z.name }}</p>
            <p class="text-slate-400">设备 {{ z.devices }} · 警情 {{ z.alarms }}</p>
            <div class="mt-1 h-1.5 w-24 overflow-hidden rounded bg-rose-950">
              <div class="h-full bg-rose-500" :style="{ width: `${z.heat}%` }" />
            </div>
          </div>
        </div>
      </div>
      <div class="panel p-3">
        <div class="panel-header !border-0">设备健康雷达</div>
        <div class="h-[280px]"><BaseChart :option="radarOption" /></div>
      </div>
    </div>

    <div class="grid gap-4 xl:grid-cols-3">
      <div class="panel p-3 xl:col-span-2">
        <div class="panel-header !border-0">24 小时警情分类趋势</div>
        <div class="h-[260px]"><BaseChart :option="lineOption" /></div>
      </div>
      <div class="panel p-3">
        <div class="panel-header !border-0">急诊 SOS 响应 SLA</div>
        <div class="h-[220px]"><BaseChart :option="gaugeOption" /></div>
      </div>
    </div>

    <div class="grid gap-4 lg:grid-cols-2">
      <div class="panel">
        <div class="panel-header">实时滚动处置通知</div>
        <ul class="max-h-72 space-y-2 overflow-auto p-3">
          <li v-for="n in notices" :key="n.id" class="rounded border border-rose-950 bg-ink-950/50 px-3 py-2 text-xs">
            <div class="flex items-center justify-between">
              <span class="badge-red">{{ ALARM_TYPE_LABELS[n.kind] || n.kind }}</span>
              <span class="text-slate-500">{{ n.time }}</span>
            </div>
            <p class="mt-1 text-slate-200">{{ n.title }}</p>
            <p class="text-slate-500">{{ n.host }} · {{ n.status }}</p>
          </li>
        </ul>
      </div>
      <div class="panel p-4" v-if="auth.hasRole(['ROLE_SUPER_ADMIN', 'ROLE_DECISION_MAKER'])">
        <div class="mb-3 text-sm font-semibold">Feature Flags</div>
        <label class="mb-3 flex items-center justify-between text-sm">
          <span>跨系统自动联动</span>
          <input
            type="checkbox"
            class="rounded border-rose-800 bg-ink-950 text-rose-600"
            :checked="app.flag('FEATURE_AUTO_CROSS_LINKAGE')"
            :disabled="!auth.hasRole(['ROLE_SUPER_ADMIN'])"
            @change="app.setFlag('FEATURE_AUTO_CROSS_LINKAGE', ($event.target as HTMLInputElement).checked)"
          />
        </label>
        <label class="flex items-center justify-between text-sm">
          <span>国密 SM4 动态脱敏</span>
          <input
            type="checkbox"
            class="rounded border-rose-800 bg-ink-950 text-rose-600"
            :checked="app.flag('FEATURE_SM4_DATA_MASKING')"
            :disabled="!auth.hasRole(['ROLE_SUPER_ADMIN'])"
            @change="app.setFlag('FEATURE_SM4_DATA_MASKING', ($event.target as HTMLInputElement).checked)"
          />
        </label>
        <p class="mt-4 text-xs text-slate-500">仅保卫处系统总管可写入开关；院领导只读态势。</p>
      </div>
    </div>
  </div>
</template>
