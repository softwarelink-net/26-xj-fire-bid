<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { fetchAudit, fetchConfigs } from '@/composables/useApi'
import { useAppStore } from '@/stores/app'
import type { SystemConfig } from '@/types'
import PageHeader from '@/components/layout/PageHeader.vue'

const app = useAppStore()
const configs = ref<SystemConfig[]>([])
const logs = ref<Array<Record<string, unknown>>>([])

onMounted(async () => {
  await app.loadConfigs()
  const c = await fetchConfigs()
  configs.value = c.data
  const a = await fetchAudit()
  logs.value = a.data
})
</script>

<template>
  <div class="space-y-5">
    <PageHeader title="系统总控与信创合规审计" subtitle="Feature Flags · 国密脱敏 · 防篡改操作日志" />
    <div class="panel p-4">
      <h3 class="mb-3 text-sm font-semibold">全局配置</h3>
      <ul class="space-y-3 text-sm">
        <li v-for="c in configs" :key="c.config_key" class="flex items-center justify-between gap-3">
          <div>
            <p class="font-mono text-xs text-rose-300">{{ c.config_key }}</p>
            <p class="text-slate-400">{{ c.description }}</p>
          </div>
          <label v-if="c.category === 'FEATURE_FLAG' || c.category === 'SECURITY'" class="flex items-center gap-2">
            <input
              type="checkbox"
              class="rounded border-rose-800 bg-ink-950 text-rose-600"
              :checked="c.config_value === 'true'"
              @change="app.setFlag(c.config_key, ($event.target as HTMLInputElement).checked)"
            />
          </label>
          <span v-else class="font-mono text-rose-200">{{ c.config_value }}</span>
        </li>
      </ul>
    </div>
    <div class="panel overflow-auto">
      <div class="panel-header">审计日志</div>
      <table class="min-w-full text-left text-xs">
        <thead class="text-slate-500">
          <tr>
            <th class="px-3 py-2">时间</th>
            <th class="px-3 py-2">用户</th>
            <th class="px-3 py-2">动作</th>
            <th class="px-3 py-2">URI</th>
            <th class="px-3 py-2">状态</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(l, i) in logs" :key="i" class="border-t border-rose-950">
            <td class="px-3 py-2 text-slate-400">{{ l.created_at }}</td>
            <td class="px-3 py-2">{{ l.username }}</td>
            <td class="px-3 py-2">{{ l.action_name }}</td>
            <td class="px-3 py-2 font-mono">{{ l.request_uri }}</td>
            <td class="px-3 py-2">{{ l.status_code }}</td>
          </tr>
        </tbody>
      </table>
      <p v-if="!logs.length" class="p-4 text-xs text-slate-500">暂无远程审计记录（本地演示可登录后产生）。</p>
    </div>
  </div>
</template>
