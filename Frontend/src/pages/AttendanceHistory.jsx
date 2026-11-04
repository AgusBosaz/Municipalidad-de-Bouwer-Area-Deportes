import { useMemo, useState, useEffect } from 'react'
import { getAttendanceHistory } from '../services/attendanceService'
import { CalendarDays, ClipboardCheck, UsersRound, UserCheck, UserX, Eye, X, Search } from 'lucide-react'
import '../styles/attendanceHistory.css'

function agruparAsistencias(asistencias) {
  const grupos = new Map()

  asistencias.forEach((asistencia) => {
    const clave = `${asistencia.activityId}-${asistencia.date}`

    if (!grupos.has(clave)) {
      grupos.set(clave, {
        id: clave,
        activityName: asistencia.activityName,
        date: asistencia.date,
        students: [],
      })
    }

    grupos.get(clave).students.push({
      id: asistencia.attendanceId,
      name: asistencia.studentName,
      document: asistencia.studentDni,
      present: asistencia.isPresent,
    })
  })

  return [...grupos.values()].sort((a, b) =>
    b.date.localeCompare(a.date)
  )
}

function formatDate(date) {
  if (!date) return '—'

  return new Date(`${date}T12:00:00`).toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

function AttendanceHistoryPage() {
  const [attendanceRecords, setAttendanceRecords] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedRecord, setSelectedRecord] = useState(null)

  useEffect(() => {
    let active = true

    getAttendanceHistory()
      .then((data) => {
        if (active) setAttendanceRecords(agruparAsistencias(data))
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

  const filteredRecords = useMemo(() => {
    return attendanceRecords.filter((record) => {
      const matchesSearch = record.activityName
        .toLowerCase()
        .includes(searchTerm.toLowerCase())

      const matchesDate = !selectedDate || record.date === selectedDate

      return matchesSearch && matchesDate
    })
  }, [attendanceRecords, searchTerm, selectedDate])

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

  const clearFilters = () => {
    setSearchTerm('')
    setSelectedDate('')
  }

  return (
    <main className="page attendance-history-page">
      <header className="page-header attendance-history-header">
        <div>
          <h1>Historial de asistencia</h1>
          <p>Consultá los registros de asistencia de las actividades.</p>
        </div>
      </header>

      <section className="attendance-history-stats">
        <article className="attendance-stat-card">
          <div className="attendance-stat-icon">
            <ClipboardCheck size={23} />
          </div>
          <div>
            <p>Registros encontrados</p>
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
            <h2>Registros de asistencia</h2>
            <p>Filtrá los registros y consultá el detalle de cada actividad.</p>
          </div>
        </div>

        <div className="attendance-history-filters">
          <label className="attendance-filter search-filter">
            <span>Buscar actividad</span>
            <div className="attendance-input-wrapper">
              <Search size={18} />
              <input
                type="text"
                placeholder="Escribí para buscar..."
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />
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
                      <td>{formatDate(record.date)}</td>
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
                        <button
                          type="button"
                          className="attendance-detail-button"
                          onClick={() => setSelectedRecord(record)}
                        >
                          <Eye size={16} />
                          Ver detalle
                        </button>
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
        <div
          className="attendance-detail-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedRecord(null)
            }
          }}
        >
          <section
            className="attendance-detail-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="attendance-detail-title"
          >
            <header className="attendance-detail-header">
              <div>
                <h2 id="attendance-detail-title">Detalle de asistencia</h2>
                <p>{selectedRecord.activityName}</p>
              </div>

              <button
                type="button"
                className="attendance-detail-close"
                aria-label="Cerrar detalle"
                onClick={() => setSelectedRecord(null)}
              >
                <X size={22} />
              </button>
            </header>

            <div className="attendance-detail-meta">
              <p>
                <strong>Fecha:</strong> {formatDate(selectedRecord.date)}
              </p>
            </div>

            {selectedRecord.students.length > 0 ? (
              <div className="table-container attendance-detail-table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Alumno/a</th>
                      <th>DNI</th>
                      <th>Asistencia</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedRecord.students.map((student) => (
                      <tr key={student.id}>
                        <td>{student.name}</td>
                        <td>{student.document}</td>
                        <td>
                          <span
                            className={`attendance-status ${student.present
                              ? 'status-registered'
                              : 'status-pending'
                              }`}
                          >
                            {student.present ? 'Presente' : 'Ausente'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="attendance-detail-empty">
                Todavía no hay alumnos registrados en este registro de
                asistencia.
              </p>
            )}

            <footer className="attendance-detail-footer">
              <button
                type="button"
                className="attendance-close-button"
                onClick={() => setSelectedRecord(null)}
              >
                Cerrar
              </button>
            </footer>
          </section>
        </div>
      )}
    </main>
  )
}

export default AttendanceHistoryPage