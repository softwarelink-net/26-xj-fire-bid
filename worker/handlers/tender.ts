import { type Env, TENDER, json } from '../lib'

export function handleTender() {
  const end = new Date(TENDER.deadline.replace(' ', 'T') + '+08:00').getTime()
  const diff = Math.max(0, end - Date.now())
  return json({
    success: true,
    data: {
      ...TENDER,
      countdown: {
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
        expired: diff <= 0,
      },
    },
  })
}

export function handleHealth(env: Env) {
  return json({
    success: true,
    data: {
      service: env.PROJECT_SLUG || '26-xj-fire-bid',
      worker: 'allworld',
      r2: '26-xj-fire-bid-assets',
      sites: 'allworld-sites/26-xj-fire-bid/',
      d1: 'Allworld',
      prefix: 'xjfire_',
      ts: new Date().toISOString(),
    },
  })
}
