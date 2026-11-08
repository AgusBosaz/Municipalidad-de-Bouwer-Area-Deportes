import { apiRequest } from './api'

export function getCoordinators() {
  return apiRequest('/Coordinators')
}

export function deactivateCoordinator(id) {
  return apiRequest(`/Users/${encodeURIComponent(id)}`, { method: 'DELETE' })
}

export function createCoordinator(data) {
  return apiRequest('/Coordinators', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}
