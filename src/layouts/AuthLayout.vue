<script setup lang="ts">
import { computed } from 'vue'
import { RouterView, RouterLink, useRoute } from 'vue-router'

const route = useRoute()
const isTender = computed(() => route.name === 'tender')
</script>

<template>
  <div
    class="relative flex min-h-[calc(100vh-40px)] items-center justify-center overflow-hidden bg-gradient-to-br from-fire-950 via-ink-950 to-slate-950 px-4 py-10"
  >
    <div
      class="pointer-events-none absolute inset-0 opacity-40"
      style="background: radial-gradient(circle at 18% 18%, #991b1b, transparent 42%), radial-gradient(circle at 82% 8%, #7f1d1d, transparent 34%)"
    />
    <div class="relative w-full" :class="isTender ? 'max-w-5xl' : 'max-w-md'">
      <div class="mb-8 text-center">
        <div class="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl border border-rose-400/50 bg-fire-900 text-rose-200">
          <span class="text-lg font-bold">消</span>
        </div>
        <h1 class="text-xl font-semibold tracking-wide text-slate-100">新疆医科大学第一附属医院</h1>
        <p class="mt-1 text-sm text-rose-200/80">智慧消防 · 视频监控 · 门禁一卡通 · 电子巡更 · XZJ266-100（3）-ZK</p>
        <div class="mt-3 flex justify-center gap-4 text-xs">
          <RouterLink to="/login" class="text-rose-300 hover:text-white">登录控制台</RouterLink>
          <RouterLink to="/tender" class="text-amber-300 hover:text-amber-100">招标公告公示</RouterLink>
        </div>
      </div>
      <RouterView />
    </div>
  </div>
</template>
