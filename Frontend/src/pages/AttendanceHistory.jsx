import { useMemo, useState } from 'react'
import { CalendarDays, ClipboardCheck, UsersRound, UserCheck, UserX, Eye, X, Search, Filter} from 'lucide-react'
import '../styles/attendanceHistory.css'

const initialAttendanceRecords = [
  {
    id: 1,
    activityName: 'Fútbol Infantil',
    date: '2026-10-19',
    teacherName: 'Juan Pérez',
    status: 'Registrada',
    students: [
      { id: 1, name: 'Lucas González', document: '45123456', present: true },
      { id: 2, name: 'Martina López', document: '46234567', present: true },
      { id: 3, name: 'Tomás Rodríguez', document: '47345678', present: false },
      { id: 4, name: 'Sofía Fernández', document: '48456789', present: true }
    ]
  },
  {
    id: 2,
    activityName: 'Natación Adultos',
    date: '2026-10-20',
    teacherName: 'María Gómez',
    status: 'Registrada',
    students: [
      { id: 5, name: 'Carlos Díaz', document: '30123456', present: true },
      { id: 6, name: 'Ana Martínez', document: '31234567', present: false },
      { id: 7, name: 'Pedro Sánchez', document: '32345678', present: true }
    ]
  },
  {
    id: 3,
    activityName: 'Yoga',
    date: '2026-10-21',
    teacherName: 'Laura Torres',
    status: 'Registrada',
    students: [
      { id: 8, name: 'Valentina Ruiz', document: '40123456', present: true },
      { id: 9, name: 'Santiago Romero', document: '41234567', present: true },
      { id: 10, name: 'Camila Herrera', document: '42345678', present: true }
    ]
  },
  {
    id: 4,
    activityName: 'Básquet Juvenil',
    date: '2026-10-23',
    teacherName: 'Juan Pérez',
    status: 'Pendiente',
    students: []
  }
]

function formatDate(date) {
  if (!date) return '—'

  return new Date(`${date}T12:00:00`).toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

function AttendanceHistoryPage() {
  const [attendanceRecords] = useState(initialAttendanceRecords)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('Todos')
  const [selectedRecord, setSelectedRecord] = useState(null)

  const filteredRecords = useMemo(() => {
    return attendanceRecords.filter((record) => {
      const matchesSearch =
        record.activityName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.teacherName.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesDate = !selectedDate || record.date === selectedDate

      const matchesStatus =
        selectedStatus === 'Todos' || record.status === selectedStatus

      return matchesSearch && matchesDate && matchesStatus
    })
  }, [attendanceRecords, searchTerm, selectedDate, selectedStatus])

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
    setSelectedStatus('Todos')
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
            <strong>{filteredRecords.length}</strong>
          </div>
        </article>

        <article className="attendance-stat-card">
          <div className="attendance-stat-icon">
            <UsersRound size={23} />
          </div>
          <div>
            <p>Alumnos registrados</p>
            <strong>{totalStudents}</strong>
          </div>
        </article>

        <article className="attendance-stat-card">
          <div className="attendance-stat-icon attendance-stat-present">
            <UserCheck size={23} />
          </div>
          <div>
            <p>Presentes</p>
            <strong>{totalPresent}</strong>
          </div>
        </article>

        <article className="attendance-stat-card">
          <div className="attendance-stat-icon attendance-stat-absent">
            <UserX size={23} />
          </div>
          <div>
            <p>Ausentes</p>
            <strong>{totalAbsent}</strong>
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
            <span>Buscar actividad o docente</span>
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

          <label className="attendance-filter">
            <span>Estado del registro</span>
            <div className="attendance-input-wrapper">
              <Filter size={18} />
              <select
                value={selectedStatus}
                onChange={(event) => setSelectedStatus(event.target.value)}
              >
                <option value="Todos">Todos</option>
                <option value="Registrada">Registrada</option>
                <option value="Pendiente">Pendiente</option>
              </select>
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
                <th>Docente</th>
                <th>Presentes</th>
                <th>Ausentes</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>

            <tbody>
              {filteredRecords.map((record) => {
                const presentCount = record.students.filter(
                  (student) => student.present
                ).length

                const absentCount = record.students.filter(
                  (student) => !student.present
                ).length

                return (
                  <tr key={record.id}>
                    <td className="attendance-activity-name">
                      {record.activityName}
                    </td>
                    <td>{formatDate(record.date)}</td>
                    <td>{record.teacherName}</td>
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
                      <span
                        className={`attendance-status ${record.status === 'Registrada'
                            ? 'status-registered'
                            : 'status-pending'
                          }`}
                      >
                        {record.status}
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
              })}

              {filteredRecords.length === 0 && (
                <tr>
                  <td colSpan="7" className="attendance-history-empty">
                    No se encontraron registros con esos filtros.
                  </td>
                </tr>
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
              <p>
                <strong>Docente:</strong> {selectedRecord.teacherName}
              </p>
              <p>
                <strong>Estado:</strong> {selectedRecord.status}
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