import { useMemo, useState, useEffect } from 'react'
import {
  CalendarDays,
  ClipboardCheck,
  Eye,
  PencilLine,
  Search,
  Trophy,
  UserCheck,
  UserX,
  UsersRound,
} from 'lucide-react'
import AttendanceDetailModal from '../components/AttendanceDetailModal'
import { getSession } from '../services/AuthSession'
import {
  formatAttendanceDate,
  getAttendanceHistoryByClass,
} from '../services/attendanceService'
import '../styles/attendanceHistory.css'

// Misma pantalla para los dos roles: el backend decide qué registros devuelve.
// Coordinador -> todas las actividades. Docente -> solo sus actividades asignadas.
function AttendanceHistoryPage() {
  const isCoordinator = getSession()?.role === 'Coordinator'
  const [attendanceRecords, setAttendanceRecords] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedActivity, setSelectedActivity] = useState('')
  const [selectedDate, setSelectedDate] = useState('')
  // Guardamos el id (no el objeto) para que el detalle se actualice al recargar.
  const [selected, setSelected] = useState(null) // { id, edit }

  useEffect(() => {
    let active = true

    getAttendanceHistoryByClass()
      .then((data) => {
        if (active) setAttendanceRecords(data)
      })
      .catch(() => {
        if (active) setError('No se pudo cargar el historial de asistencia.')
      })
      .finally(() => {
        if (active) setCargando(false)
      })

    return () => {
      active = false
    }
  }, [])

  // Se llama después de editar para traer los datos actualizados.
  async function recargarHistorial() {
    const data = await getAttendanceHistoryByClass()
    setAttendanceRecords(data)
  }

  const activityOptions = useMemo(() => {
    const actividades = new Map()
    attendanceRecords.forEach((record) => {
      actividades.set(record.activityId, record.activityName)
    })

    return [...actividades.entries()]
      .map(([id, name]) => ({ id: String(id), name }))
      .sort((a, b) => a.name.localeCompare(b.name))
  }, [attendanceRecords])

  const filteredRecords = useMemo(() => {
    const busqueda = searchTerm.trim().toLowerCase()

    return attendanceRecords.filter((record) => {
      const matchesSearch = !busqueda ||
        record.activityName.toLowerCase().includes(busqueda) ||
        record.students.some((student) =>
          student.name.toLowerCase().includes(busqueda) ||
          student.document.includes(busqueda))

      const matchesActivity = !selectedActivity ||
        String(record.activityId) === selectedActivity

      const matchesDate = !selectedDate || record.date === selectedDate

      return matchesSearch && matchesActivity && matchesDate
    })
  }, [attendanceRecords, searchTerm, selectedActivity, selectedDate])

  const totalStudents = filteredRecords.reduce(
    (total, record) => total + record.students.length,
    0
  )

  const totalPresent = filteredRecords.reduce(
    (total, record) =>
      total + record.students.filter((student) => student.present).length,
    0
  )

  const totalAbsent = totalStudents - totalPresent

  const selectedRecord = selected
    ? attendanceRecords.find((record) => record.id === selected.id)
    : null

  const clearFilters = () => {
    setSearchTerm('')
    setSelectedActivity('')
    setSelectedDate('')
  }

  return (
    <main className="page attendance-history-page">
      <header className="page-header attendance-history-header">
        <div>
          <h1>Historial de asistencia</h1>
          <p>
            {isCoordinator
              ? 'Consultá y corregí los registros de asistencia de todas las actividades.'
              : 'Consultá y corregí la asistencia de las clases que tenés asignadas.'}
          </p>
        </div>
      </header>

      <section className="attendance-history-stats">
        <article className="attendance-stat-card">
          <div className="attendance-stat-icon">
            <ClipboardCheck size={23} />
          </div>
          <div>
            <p>Clases registradas</p>
            <strong>{cargando || error ? '—' : filteredRecords.length}</strong>
          </div>
        </article>

        <article className="attendance-stat-card">
          <div className="attendance-stat-icon">
            <UsersRound size={23} />
          </div>
          <div>
            <p>Asistencias de alumnos</p>
            <strong>{cargando || error ? '—' : totalStudents}</strong>
          </div>
        </article>

        <article className="attendance-stat-card">
          <div className="attendance-stat-icon attendance-stat-present">
            <UserCheck size={23} />
          </div>
          <div>
            <p>Presentes</p>
            <strong>{cargando || error ? '—' : totalPresent}</strong>
          </div>
        </article>

        <article className="attendance-stat-card">
          <div className="attendance-stat-icon attendance-stat-absent">
            <UserX size={23} />
          </div>
          <div>
            <p>Ausentes</p>
            <strong>{cargando || error ? '—' : totalAbsent}</strong>
          </div>
        </article>
      </section>

      <section className="content-card attendance-history-content">
        <div className="content-card-header attendance-history-card-header">
          <div>
            <h2>{isCoordinator ? 'Registros de asistencia' : 'Mis clases registradas'}</h2>
            <p>Filtrá los registros, consultá el detalle de cada clase y editá la asistencia.</p>
          </div>
        </div>

        <div className="attendance-history-filters">
          <label className="attendance-filter search-filter">
            <span>Buscar actividad o alumno</span>
            <div className="attendance-input-wrapper">
              <Search size={18} />
              <input
                type="text"
                placeholder="Nombre, DNI o actividad..."
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />
            </div>
          </label>

          <label className="attendance-filter">
            <span>Actividad</span>
            <div className="attendance-input-wrapper">
              <Trophy size={18} />
              <select
                value={selectedActivity}
                onChange={(event) => setSelectedActivity(event.target.value)}
              >
                <option value="">Todas</option>
                {activityOptions.map((activity) => (
                  <option key={activity.id} value={activity.id}>
                    {activity.name}
                  </option>
                ))}
              </select>
            </div>
          </label>

          <label className="attendance-filter">
            <span>Fecha</span>
            <div className="attendance-input-wrapper">
              <CalendarDays size={18} />
              <input
                type="date"
                value={selectedDate}
                onChange={(event) => setSelectedDate(event.target.value)}
              />
            </div>
          </label>
          <button
            type="button"
            className="attendance-clear-button"
            onClick={clearFilters}
          >
            Limpiar filtros
          </button>
        </div>

        <div className="table-container attendance-history-table-container">
          <table className="attendance-history-table">
            <thead>
              <tr>
                <th>Actividad</th>
                <th>Fecha</th>
                <th>Presentes</th>
                <th>Ausentes</th>
                <th>Acciones</th>
              </tr>
            </thead>

            <tbody>
              {cargando ? (
                <tr>
                  <td colSpan="5">Cargando historial...</td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan="5" role="alert">{error}</td>
                </tr>
              ) : attendanceRecords.length === 0 ? (
                <tr>
                  <td colSpan="5" className="attendance-history-empty">
                    {isCoordinator
                      ? 'Todavía no hay asistencias registradas.'
                      : 'Todavía no hay asistencias registradas en tus clases.'}
                  </td>
                </tr>
              ) : filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan="5" className="attendance-history-empty">
                    No se encontraron registros con esos filtros.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((record) => {
                  const presentCount = record.students.filter(
                    (student) => student.present
                  ).length

                  const absentCount = record.students.length - presentCount

                  return (
                    <tr key={record.id}>
                      <td className="attendance-activity-name">
                        {record.activityName}
                      </td>
                      <td>{formatAttendanceDate(record.date)}</td>
                      <td>
                        <span className="attendance-count present-count">
                          {presentCount}
                        </span>
                      </td>
                      <td>
                        <span className="attendance-count absent-count">
                          {absentCount}
                        </span>
                      </td>
                      <td>
                        <div className="attendance-row-actions">
                          <button
                            type="button"
                            className="attendance-detail-button"
                            onClick={() => setSelected({ id: record.id, edit: false })}
                          >
                            <Eye size={16} />
                            Ver detalle
                          </button>
                          <button
                            type="button"
                            className="attendance-detail-button attendance-edit-button"
                            onClick={() => setSelected({ id: record.id, edit: true })}
                            aria-label={`Editar asistencia de ${record.activityName} del ${formatAttendanceDate(record.date)}`}
                          >
                            <PencilLine size={16} />
                            Editar
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </section>

      {selectedRecord && (
        <AttendanceDetailModal
          key={selectedRecord.id}
          record={selectedRecord}
          startInEditMode={selected.edit}
          onClose={() => setSelected(null)}
          onSaved={recargarHistorial}
        />
      )}
    </main>
  )
}

export default AttendanceHistoryPage
