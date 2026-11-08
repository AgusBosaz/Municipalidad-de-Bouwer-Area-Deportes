import { apiRequest } from './api'

export function getAttendanceStudents(activityId) {
  return apiRequest(`/StudentAttendance/activity/${encodeURIComponent(activityId)}/students`)
}

export function getActivityAttendance(activityId, date) {
  return apiRequest(
    `/StudentAttendance/activity/${encodeURIComponent(activityId)}?date=${encodeURIComponent(date)}`,
  )
}

export function saveActivityAttendance(activityId, date, entries, instructorId) {
  return apiRequest(`/StudentAttendance/activity/${encodeURIComponent(activityId)}`, {
    method: 'PUT',
    body: JSON.stringify({ date, entries, instructorId }),
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
        startTime: record.startTime,
        endTime: record.endTime,
        date: record.date,
        instructors: [],
        students: [],
      })
    }

    const docente = record.instructorName || 'Docente no registrado'
    if (!grupos.get(clave).instructors.includes(docente)) grupos.get(clave).instructors.push(docente)

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

function fechaHoraArgentina(now) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Argentina/Buenos_Aires',
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23',
  }).formatToParts(now)
  const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]))
  const fecha = `${values.year}-${values.month}-${values.day}`
  const hora = `${values.hour}:${values.minute}:${values.second}`
  return { fecha, hora }
}

export function fechaArgentina(now = new Date()) {
  return fechaHoraArgentina(now).fecha
}

export function canEditDuringClass(record, now = new Date()) {
  if (!record?.date || !record.startTime || !record.endTime) return false
  const { fecha, hora } = fechaHoraArgentina(now)
  return record.date === fecha && hora >= record.startTime.slice(0, 8) && hora < record.endTime.slice(0, 8)
}

export function canTakeAttendance(activity, now = new Date()) {
  const fecha = fechaArgentina(now)
  const dia = new Date(`${fecha}T12:00:00Z`).getUTCDay()
  const mascara = dia === 0 ? 64 : 2 ** (dia - 1)
  return Boolean(activity && (activity.days & mascara) &&
    canEditDuringClass({ date: fecha, startTime: activity.startTime, endTime: activity.endTime }, now))
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
