const SESSION_KEY = 'bouwer-session'

export function saveSession(session) {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(session))
}

export function getSession() {
    try{
        const session = JSON.parse(sessionStorage.getItem(SESSION_KEY) ?? 'null')
        const expiresAt = Date.parse(session?.expiresAt)

        if (!session?.token || !Number.isFinite(expiresAt) || expiresAt <= Date.now()) {
            sessionStorage.removeItem(SESSION_KEY)
            return null
        }

        const role = session.roles?.includes('Coordinator')
            ? 'Coordinator'
            : session.roles?.includes('Instructor')
                ? 'Instructor'
                : null
        if (!role) return null

        return {
            ...session,
            name: session.fullName,
            role,
        }
    } catch {
        sessionStorage.removeItem(SESSION_KEY)
        return null
    }
}

export function clearSession() {
    sessionStorage.removeItem(SESSION_KEY)
}