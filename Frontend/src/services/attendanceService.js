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

// El backend filtra según el token: el coordinador recibe todo el historial
// y el docente solo el de las actividades que tiene asignadas.
export function getAttendanceHistory() {
  return apiRequest('/StudentAttendance/history')
}

// Modifica un registro puntual (PUT /api/StudentAttendance/{id}).
// attendance = { studentActivityId, date, isPresent }
export function updateAttendance(id, attendance) {
  return apiRequest(`/StudentAttendance/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: JSON.stringify(attendance),
  })
}

// Agrupa los registros del historial por clase (actividad + fecha).
export function groupAttendanceByClass(records) {
  const grupos = new Map()

  records.forEach((record) => {
    const clave = `${record.activityId}-${record.date}`

    if (!grupos.has(clave)) {
      grupos.set(clave, {
        id: clave,
        activityId: record.activityId,
        activityName: record.activityName,
        date: record.date,
        students: [],
      })
    }

    grupos.get(clave).students.push({
      id: record.attendanceId,
      studentActivityId: record.studentActivityId,
      name: record.studentName,
      document: record.studentDni,
      present: record.isPresent,
    })
  })

  return [...grupos.values()]
    .map((grupo) => ({
      ...grupo,
      students: grupo.students.sort((a, b) => a.name.localeCompare(b.name)),
    }))
    .sort((a, b) =>
      b.date.localeCompare(a.date) || a.activityName.localeCompare(b.activityName),
    )
}

export async function getAttendanceHistoryByClass() {
  const records = await getAttendanceHistory()
  return groupAttendanceByClass(records)
}

export function formatAttendanceDate(date) {
  if (!date) return '—'

  return new Date(`${date}T12:00:00`).toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}
