import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { ALL_ROLES } from '@/types'

const SITE_TITLE = '2026新医大一附院智慧消防及安防弱电智能化系统招标公告'

const router = createRouter({
  history: createWebHistory(),
  scrollBehavior: () => ({ top: 0 }),
  routes: [
    {
      path: '/login',
      component: () => import('@/layouts/AuthLayout.vue'),
      meta: { requiresAuth: false },
      children: [
        {
          path: '',
          name: 'login',
          component: () => import('@/views/auth/LoginView.vue'),
          meta: { requiresAuth: false, title: '身份认证' },
        },
      ],
    },
    {
      path: '/tender',
      component: () => import('@/layouts/AuthLayout.vue'),
      meta: { requiresAuth: false },
      children: [
        {
          path: '',
          name: 'tender',
          component: () => import('@/views/tender/TenderView.vue'),
          meta: { requiresAuth: false, title: '招标公告' },
        },
      ],
    },
    {
      path: '/',
      component: () => import('@/layouts/MainLayout.vue'),
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          name: 'dashboard',
          component: () => import('@/views/dashboard/DashboardView.vue'),
          meta: { title: '全景安防消防态势大屏', roles: ALL_ROLES },
        },
        {
          path: 'iot-center',
          name: 'iot-center',
          component: () => import('@/views/iot-center/IotCenterView.vue'),
          meta: {
            title: '五大子系统联动工作台',
            roles: ['ROLE_SUPER_ADMIN', 'ROLE_SECURITY_DISPATCHER', 'ROLE_PATROL_GUARD'],
          },
        },
        {
          path: 'alarms',
          name: 'alarms',
          component: () => import('@/views/alarms/AlarmsView.vue'),
          meta: {
            title: '实时报警调度与联动',
            roles: ['ROLE_SUPER_ADMIN', 'ROLE_SECURITY_DISPATCHER', 'ROLE_PATROL_GUARD'],
          },
        },
        {
          path: 'patrol',
          name: 'patrol',
          component: () => import('@/views/patrol/PatrolView.vue'),
          meta: {
            title: '电子巡更与隐患排查',
            roles: ['ROLE_SUPER_ADMIN', 'ROLE_SECURITY_DISPATCHER', 'ROLE_PATROL_GUARD'],
          },
        },
        {
          path: 'system',
          name: 'system',
          component: () => import('@/views/system/SystemGovernance.vue'),
          meta: { title: '系统总控与信创审计', roles: ['ROLE_SUPER_ADMIN'] },
        },
        {
          path: '403',
          name: 'forbidden',
          component: () => import('@/views/system/ForbiddenView.vue'),
          meta: { title: '无权访问', requiresAuth: true },
        },
      ],
    },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
})

router.beforeEach((to, _from, next) => {
  const auth = useAuthStore()
  const requiresAuth = to.matched.some((r) => r.meta.requiresAuth !== false) && to.meta.requiresAuth !== false
  const publicPage = to.meta.requiresAuth === false || to.matched.some((r) => r.meta.requiresAuth === false)

  if (to.name === 'tender' || to.path === '/tender') {
    return next()
  }

  if (!auth.isAuthenticated && requiresAuth && !publicPage) {
    return next({ name: 'login', query: { redirect: to.fullPath } })
  }

  if (auth.isAuthenticated && to.name === 'login') {
    return next({ name: 'dashboard' })
  }

  const roles = to.meta.roles as string[] | undefined
  if (roles && auth.isAuthenticated && !auth.hasRole(roles)) {
    return next({ name: 'forbidden' })
  }

  return next()
})

router.afterEach((to) => {
  const page = (to.meta.title as string) || ''
  document.title = page ? `${page} · ${SITE_TITLE}` : SITE_TITLE
})

export default router
