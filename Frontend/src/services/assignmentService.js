import { apiRequest } from './api'

export function getAssignments(instructorId = null) {
  const query = instructorId == null
    ? ''
    : `?instructorId=${encodeURIComponent(instructorId)}`

  return apiRequest(`/Assignments${query}`)
}

export function getMyAssignments() {
  return apiRequest('/Assignments/mine')
}

export function assignInstructor(assignment) {
  return apiRequest('/Assignments', {
    method: 'POST',
    body: JSON.stringify(assignment),
  })
}

export function unassignInstructor(id) {
  return apiRequest(`/Assignments/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  })
}
