import { apiRequest } from './api'

export function login(dni, password) {
    return apiRequest('/Auth/login', {
        method: 'POST',
        body: JSON.stringify({ dni, password }),
    })
}

export function getCurrentUser() {
    return apiRequest('/Auth/me')
}

export function requestPasswordReset(email) {
    return apiRequest('/Auth/password-reset/request', {
        method: 'POST',
        body: JSON.stringify({ email }),
    })
}

export function resetPassword(token, password) {
    return apiRequest('/Auth/password-reset/confirm', {
        method: 'POST',
        body: JSON.stringify({ token, password }),
    })
}

export function changeInitialPassword(newPassword) {
    return apiRequest('/Auth/change-initial-password', {
        method: 'POST',
        body: JSON.stringify({ newPassword }),
    })
}