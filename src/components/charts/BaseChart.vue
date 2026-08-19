<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue'
import type { EChartsCoreOption } from 'echarts/core'
import * as echarts from 'echarts/core'
import { BarChart, GaugeChart, LineChart, PieChart, RadarChart } from 'echarts/charts'
import {
  GridComponent,
  LegendComponent,
  TooltipComponent,
  TitleComponent,
  RadarComponent,
} from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'

echarts.use([
  BarChart,
  GaugeChart,
  LineChart,
  PieChart,
  RadarChart,
  GridComponent,
  LegendComponent,
  TooltipComponent,
  TitleComponent,
  RadarComponent,
  CanvasRenderer,
])

const props = defineProps<{ option: EChartsCoreOption }>()
const el = ref<HTMLDivElement | null>(null)
let chart: echarts.ECharts | null = null

function render() {
  if (!el.value) return
  if (!chart) chart = echarts.init(el.value)
  chart.setOption(props.option, true)
}

function resize() {
  chart?.resize()
}

onMounted(() => {
  render()
  window.addEventListener('resize', resize)
})

onUnmounted(() => {
  window.removeEventListener('resize', resize)
  chart?.dispose()
  chart = null
})

watch(() => props.option, render, { deep: true })
</script>

<template>
  <div ref="el" class="h-full min-h-[220px] w-full" />
</template>
