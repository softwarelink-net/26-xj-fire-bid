<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { RouterView, RouterLink, useRoute, useRouter } from 'vue-router'
import {
  ChartBarIcon,
  CpuChipIcon,
  BellAlertIcon,
  MapIcon,
  Cog6ToothIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ArrowRightOnRectangleIcon,
  FireIcon,
  PhoneArrowUpRightIcon,
  UserGroupIcon,
} from '@heroicons/vue/24/outline'
import { useAuthStore } from '@/stores/auth'
import { useAppStore } from '@/stores/app'
import { DEMO_USERS, fetchDashboard } from '@/composables/useApi'
import { ALL_ROLES } from '@/types'

const auth = useAuthStore()
const app = useAppStore()
const route = useRoute()
const router = useRouter()
const switching = ref(false)

const navItems = [
  { name: 'dashboard', label: '态势感知大屏', icon: ChartBarIcon, roles: ALL_ROLES },
  {
    name: 'iot-center',
    label: '五大子系统工作台',
    icon: CpuChipIcon,
    roles: ['ROLE_SUPER_ADMIN', 'ROLE_SECURITY_DISPATCHER', 'ROLE_PATROL_GUARD'],
  },
  {
    name: 'alarms',
    label: '实时报警调度',
    icon: BellAlertIcon,
    roles: ['ROLE_SUPER_ADMIN', 'ROLE_SECURITY_DISPATCHER', 'ROLE_PATROL_GUARD'],
  },
  {
    name: 'patrol',
    label: '电子巡更隐患',
    icon: MapIcon,
    roles: ['ROLE_SUPER_ADMIN', 'ROLE_SECURITY_DISPATCHER', 'ROLE_PATROL_GUARD'],
  },
  { name: 'system', label: '系统总控', icon: Cog6ToothIcon, roles: ['ROLE_SUPER_ADMIN'] },
]

const visibleNav = computed(() => navItems.filter((item) => auth.hasRole(item.roles)))

const breadcrumbs = computed(() => {
  const crumbs: { label: string; to: string | null }[] = [{ label: '首页', to: '/' }]
  if (route.name && route.name !== 'dashboard') {
    crumbs.push({ label: (route.meta.title as string) || String(route.name), to: null })
  }
  return crumbs
})

function logout() {
  auth.logout()
  router.push({ name: 'login' })
}

async function switchDemo(username: string) {
  const demo = DEMO_USERS.find((u) => u.username === username)
  if (!demo) return
  switching.value = true
  try {
    await auth.login(demo.username, demo.password)
    if (route.meta.roles && !auth.hasRole(route.meta.roles as string[])) {
      await router.push({ name: 'dashboard' })
    }
  } finally {
    switching.value = false
  }
}

onMounted(async () => {
  void app.loadConfigs()
  try {
    const dash = await fetchDashboard()
    const k = (dash.data.kpis || {}) as Record<string, number>
    app.fireCount = k.fireAlarms || 0
    app.sosCount = k.sos || 0
    app.patrolOnline = k.patrolOnline || 12
    app.ticker = `火警 ${k.fireAlarms || 0} · SOS ${k.sos || 0} · 待处置 ${k.pending || 0} · 设备完好率 ${k.health || 0}% · 巡更在线 ${k.patrolOnline || 12}`
  } catch {
    /* ticker already set */
  }
})
</script>

<template>
  <div class="flex min-h-[calc(100vh-40px)]">
    <aside
      :class="[
        'sticky top-0 h-[calc(100vh-40px)] shrink-0 border-r border-rose-950/80 bg-ink-900/95 transition-all duration-200',
        app.sidebarCollapsed ? 'w-[72px]' : 'w-60',
      ]"
    >
      <div class="flex h-14 items-center justify-between border-b border-rose-950/80 px-3">
        <div v-if="!app.sidebarCollapsed" class="min-w-0">
          <p class="truncate text-sm font-semibold text-rose-300">智慧消防安防中枢</p>
          <p class="truncate text-[10px] text-slate-500">XZJ266-100（3）-ZK</p>
        </div>
        <button class="btn-ghost !p-1.5" :title="app.sidebarCollapsed ? '展开' : '收起'" @click="app.toggleSidebar()">
          <ChevronRightIcon v-if="app.sidebarCollapsed" class="h-4 w-4" />
          <ChevronLeftIcon v-else class="h-4 w-4" />
        </button>
      </div>

      <nav class="space-y-1 overflow-y-auto p-2" style="max-height: calc(100vh - 220px)">
        <RouterLink
          v-for="item in visibleNav"
          :key="item.name"
          :to="{ name: item.name }"
          class="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm text-slate-300 transition hover:bg-rose-950/50 hover:text-white"
          :class="{ 'bg-rose-600/20 text-rose-200 ring-1 ring-rose-400/30': route.name === item.name }"
        >
          <component :is="item.icon" class="h-4 w-4 shrink-0" />
          <span v-if="!app.sidebarCollapsed">{{ item.label }}</span>
        </RouterLink>
      </nav>

      <div class="absolute bottom-0 left-0 right-0 border-t border-rose-950/80 p-3">
        <div v-if="!app.sidebarCollapsed" class="mb-2 truncate text-xs text-slate-400">
          {{ auth.roleLabel }}
        </div>
        <button class="btn-ghost w-full !justify-start" @click="logout">
          <ArrowRightOnRectangleIcon class="h-4 w-4" />
          <span v-if="!app.sidebarCollapsed">退出登录</span>
        </button>
      </div>
    </aside>

    <div class="flex min-w-0 flex-1 flex-col">
      <div class="overflow-hidden border-b border-rose-500/20 bg-rose-500/10 px-4 py-1 text-[11px] text-rose-200">
        <div class="marquee-track flex w-max gap-16 whitespace-nowrap">
          <span>{{ app.ticker }} · 跨系统联动{{ app.flag('FEATURE_AUTO_CROSS_LINKAGE') ? '启用' : '关闭' }} · SM4 脱敏{{ app.flag('FEATURE_SM4_DATA_MASKING') ? '启用' : '关闭' }}</span>
          <span>{{ app.ticker }} · 跨系统联动{{ app.flag('FEATURE_AUTO_CROSS_LINKAGE') ? '启用' : '关闭' }} · SM4 脱敏{{ app.flag('FEATURE_SM4_DATA_MASKING') ? '启用' : '关闭' }}</span>
        </div>
      </div>
      <header
        class="sticky top-0 z-40 flex h-14 items-center justify-between gap-3 border-b border-rose-950/80 bg-ink-950/80 px-4 backdrop-blur"
      >
        <nav class="flex min-w-0 items-center gap-2 text-sm text-slate-400">
          <template v-for="(c, i) in breadcrumbs" :key="i">
            <RouterLink v-if="c.to" :to="c.to" class="hover:text-rose-300">{{ c.label }}</RouterLink>
            <span v-else class="truncate text-slate-200">{{ c.label }}</span>
            <span v-if="i < breadcrumbs.length - 1" class="text-slate-600">/</span>
          </template>
        </nav>
        <div class="flex items-center gap-3 text-xs">
          <div class="hidden items-center gap-2 rounded-full border border-rose-500/30 bg-rose-500/10 px-2 py-1 text-rose-200 lg:flex">
            <FireIcon class="h-3.5 w-3.5" />
            火警 {{ app.fireCount }}
          </div>
          <div class="hidden items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-1 text-amber-200 xl:flex">
            <PhoneArrowUpRightIcon class="h-3.5 w-3.5" />
            SOS {{ app.sosCount }}
          </div>
          <div class="hidden items-center gap-2 rounded-full border border-sky-500/30 bg-sky-500/10 px-2 py-1 text-sky-200 xl:flex">
            <UserGroupIcon class="h-3.5 w-3.5" />
            巡更 {{ app.patrolOnline }}
          </div>
          <label class="hidden items-center gap-2 xl:flex">
            <span class="text-slate-500">角色</span>
            <select
              class="rounded border-rose-950 bg-ink-950 py-1 text-xs text-slate-200"
              :value="auth.user?.username"
              :disabled="switching"
              @change="switchDemo(($event.target as HTMLSelectElement).value)"
            >
              <option v-for="d in DEMO_USERS" :key="d.username" :value="d.username">
                {{ d.full_name }}
              </option>
            </select>
          </label>
          <div class="text-right">
            <p class="font-medium text-slate-200">{{ auth.displayName }}</p>
            <p class="max-w-[180px] truncate text-slate-500">{{ auth.user?.department }}</p>
          </div>
        </div>
      </header>

      <main class="flex-1 overflow-auto p-4 md:p-6">
        <RouterView />
      </main>
    </div>
  </div>
</template>
