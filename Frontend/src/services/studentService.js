import { apiRequest } from './api'

export function createStudent(student) {
  return apiRequest('/Students', {
    method: 'POST',
    body: JSON.stringify(student),
  })
}

export function getStudents() {
  return apiRequest('/Students')
}