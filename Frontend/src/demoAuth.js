const SESSION_KEY = 'bouwer-demo-session'

const users = [
  {
    username: 'coordinador',
    password: 'demo123',
    role: 'Coordinator',
    name: 'Coordinador Demo',
  },
  {
    username: 'docente',
    password: 'demo123',
    role: 'Instructor',
    name: 'Docente Demo',
  },
]

export function loginDemo(username, password) {
  const user = users.find(
    (item) =>
      item.username === username.trim().toLowerCase() &&
      item.password === password
  )

  if (!user) return null

  const session = { role: user.role, name: user.name }
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(session))
  return session
}

export function getDemoSession() {
  try {
    const session = JSON.parse(sessionStorage.getItem(SESSION_KEY) ?? 'null')
    return ['Coordinator', 'Instructor'].includes(session?.role)
      ? session
      : null
  } catch {
    return null
  }
}

export function logoutDemo() {
  sessionStorage.removeItem(SESSION_KEY)
}