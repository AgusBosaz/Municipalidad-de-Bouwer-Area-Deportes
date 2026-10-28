import { apiRequest } from './api'

export function registerStudent(studentId, activityId) {
  return apiRequest('/Inscriptions', {
    method: 'POST',
    body: JSON.stringify({ studentId, activityId }),
  })
}

export function getInscriptions() {
  return apiRequest('/Inscriptions')
}