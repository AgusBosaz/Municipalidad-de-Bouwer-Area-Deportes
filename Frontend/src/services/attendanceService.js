import { apiRequest } from './api'

export function getAttendanceStudents(activityId) {
  return apiRequest(`/StudentAttendance/activity/${encodeURIComponent(activityId)}/students`)
}

export function getActivityAttendance(activityId, date) {
  return apiRequest(
    `/StudentAttendance/activity/${encodeURIComponent(activityId)}?date=${encodeURIComponent(date)}`,
  )
}

export function saveActivityAttendance(activityId, date, entries) {
  return apiRequest(`/StudentAttendance/activity/${encodeURIComponent(activityId)}`, {
    method: 'PUT',
    body: JSON.stringify({ date, entries }),
  })
}

export function getAttendanceHistory() {
  return apiRequest('/StudentAttendance/history')
}
