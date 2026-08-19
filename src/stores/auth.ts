import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { loginApi } from '@/composables/useApi'
import { ROLE_LABELS, type AuthUser, type Role } from '@/types'

const TOKEN_KEY = 'xjfire_token'

export const useAuthStore = defineStore(
  'auth',
  () => {
    const token = ref('')
    const user = ref<AuthUser | null>(null)

    const isAuthenticated = computed(() => !!token.value && !!user.value)
    const role = computed(() => (user.value?.role || '') as Role | '')
    const roleLabel = computed(() => (role.value ? ROLE_LABELS[role.value as Role] : ''))
    const displayName = computed(() => user.value?.full_name || user.value?.username || '访客')

    function hasRole(roles: string[] = []) {
      if (!roles.length) return true
      if (role.value === 'ROLE_SUPER_ADMIN') return true
      return roles.includes(role.value)
    }

    async function login(username: string, password: string) {
      const res = await loginApi(username, password)
      token.value = res.token
      user.value = res.user
      localStorage.setItem(TOKEN_KEY, res.token)
      return res.user
    }

    function logout() {
      token.value = ''
      user.value = null
      localStorage.removeItem(TOKEN_KEY)
    }

    if (token.value) localStorage.setItem(TOKEN_KEY, token.value)

    return { token, user, isAuthenticated, role, roleLabel, displayName, hasRole, login, logout }
  },
  { persist: true },
)
