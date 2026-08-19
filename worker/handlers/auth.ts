import {
  type Env,
  type AuthUser,
  DEMO_PASSWORDS,
  MOCK_USERS,
  error,
  json,
  parseBody,
  queryFirst,
  requireAuth,
  signJwt,
  writeAudit,
} from '../lib'

export async function handleLogin(request: Request, env: Env) {
  const body = await parseBody<{ username?: string; password?: string }>(request)
  const username = body?.username?.trim()
  if (!username || !body?.password) {
    return error('请提供账号与密码')
  }

  let user = await queryFirst<AuthUser>(
    env,
    'SELECT id, username, full_name, department, role, phone, badge_no FROM xjfire_users WHERE username = ? AND status = 1',
    [username],
  )
  if (!user) {
    user = MOCK_USERS.find((u) => u.username === username) || null
  }

  const expected = DEMO_PASSWORDS[username]
  if (!user || expected !== body.password) {
    await writeAudit(env, null, 'LOGIN_FAILED', request, 401)
    return error('账号或密码错误', 401)
  }

  const secret = env.JWT_SECRET || 'xj-fire-bid-demo-jwt-secret-2026'
  const token = await signJwt(
    {
      id: user.id,
      username: user.username,
      full_name: user.full_name,
      department: user.department,
      role: user.role,
      phone: user.phone,
      badge_no: user.badge_no,
    },
    secret,
  )

  await writeAudit(env, user, 'LOGIN', request, 200)
  return json({ success: true, token, user })
}

export async function handleMe(request: Request, env: Env) {
  const auth = await requireAuth(request, env)
  if (auth.error) return auth.error
  return json({ success: true, user: auth.user })
}
