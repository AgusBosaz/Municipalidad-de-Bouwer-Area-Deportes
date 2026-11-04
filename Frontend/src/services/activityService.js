import { apiRequest } from './api'

export function getActivities() {
  return apiRequest('/Activity')
}

export function getActivityById(id) {
  return apiRequest(`/Activity/${encodeURIComponent(id)}`)
}

export function createActivity(activity) {
  return apiRequest('/Activity', {
    method: 'POST',
    body: JSON.stringify(activity),
  })
}

export function updateActivity(id, activity) {
  return apiRequest(`/Activity/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: JSON.stringify(activity),
  })
}

export function deleteActivity(id) {
  return apiRequest(`/Activity/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  })
}

export function getPublicActivities() {
  return apiRequest('/Activity/public')
}
