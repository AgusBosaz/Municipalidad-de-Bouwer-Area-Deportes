import { apiRequest } from './api'

export function getInstructors() {
  return apiRequest('/Instructor')
}

export function getInactiveInstructors() {
  return apiRequest('/Instructor/inactive')
}

export function reactivateInstructor(id) {
  return apiRequest(`/Instructor/${encodeURIComponent(id)}/reactivate`, { method: 'POST' })
}

export function getInstructorById(id) {
  return apiRequest(`/Instructor/${encodeURIComponent(id)}`)
}

export function CreateInstructor(instructor) {
  return apiRequest('/Instructor/CreateInstructor', {
    method: 'POST',
    body: JSON.stringify(instructor),
  })
}

export function UpdateInstructor(id, instructor) {
  return apiRequest(`/Instructor/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: JSON.stringify(instructor),
  })
}

export function DeleteInstructor(id) {
  return apiRequest(`/Instructor/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  })
}
