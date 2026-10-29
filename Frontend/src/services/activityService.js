import { apiRequest } from './api'

export function getActivities() {
  return apiRequest('/Activity')
}

export function getActivityById(id) {
  return apiRequest(`/Activity/${encodeURIComponent(id)}`)
}
