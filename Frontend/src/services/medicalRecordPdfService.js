import { apiRequest } from './api'

export function getMedicalRecordPdf(studentId) {
  return apiRequest(`/students/${studentId}/medical-record/pdf`, { responseType: 'blob' })
}

export function saveMedicalRecordPdf(studentId, file) {
  const data = new FormData()
  data.append('file', file)
  return apiRequest(`/students/${studentId}/medical-record/pdf`, {
    method: 'PUT',
    body: data,
  })
}
