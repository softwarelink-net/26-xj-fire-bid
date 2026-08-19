import { defineStore } from 'pinia'
import { ref } from 'vue'
import { fetchConfigs, updateConfig } from '@/composables/useApi'
import type { SystemConfig } from '@/types'

export const useAppStore = defineStore(
  'app',
  () => {
    const sidebarCollapsed = ref(false)
    const configs = ref<SystemConfig[]>([])
    const fireCount = ref(1)
    const sosCount = ref(0)
    const patrolOnline = ref(12)
    const ticker = ref('新医大一附院智慧消防安防中枢在线 · 烟感/水压/SOS 秒级联动 · 巡更 RFID 闭环核验')

    function toggleSidebar() {
      sidebarCollapsed.value = !sidebarCollapsed.value
    }

    function flag(key: string, fallback = true) {
      const hit = configs.value.find((c) => c.config_key === key)
      if (!hit) return fallback
      return hit.config_value === 'true'
    }

    async function loadConfigs() {
      try {
        const res = await fetchConfigs()
        configs.value = res.data || []
      } catch {
        configs.value = [
          { config_key: 'FEATURE_AUTO_CROSS_LINKAGE', config_value: 'true', category: 'FEATURE_FLAG' },
          { config_key: 'FEATURE_SM4_DATA_MASKING', config_value: 'true', category: 'SECURITY' },
          { config_key: 'EMERGENCY_RESPONSE_SLA_SECONDS', config_value: '60', category: 'SLA' },
        ]
      }
    }

    async function setFlag(key: string, value: boolean) {
      await updateConfig(key, value ? 'true' : 'false')
      await loadConfigs()
    }

    return {
      sidebarCollapsed,
      configs,
      fireCount,
      sosCount,
      patrolOnline,
      ticker,
      toggleSidebar,
      flag,
      loadConfigs,
      setFlag,
    }
  },
  { persist: { pick: ['sidebarCollapsed'] } },
)
