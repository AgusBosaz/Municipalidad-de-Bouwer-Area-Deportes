import { useMemo, useState } from 'react'
import {
  CalendarDays,
  ClipboardCheck,
  Eye,
  Search,
  UsersRound,
  UserCheck,
  UserX,
  X,
  RotateCcw,
} from 'lucide-react'
import '../styles/AttendanceHistory.css'

const initialAttendanceRecords = [
  {
    id: 1,
    activity: 'Fútbol Infantil',
    teacher: 'Juan Pérez',
    date: '2026-10-24',
    time: '16:00',
    students: [
      { id: 1, name: 'Lucas Fernández', documentNumber: '45123456', present: true },
      { id: 2, name: 'Sofía Gómez', documentNumber: '45987654', present: true },
      { id: 3, name: 'Mateo Rodríguez', documentNumber: '44777111', present: false },
      { id: 4, name: 'Valentina López', documentNumber: '46222333', present: true },
    ],
  },
  {
    id: 2,
    activity: 'Vóley Juvenil',
    teacher: 'María González',
    date: '2026-10-23',
    time: '17:30',
    students: [
      { id: 5, name: 'Camila Torres', documentNumber: '45333444', present: true },
      { id: 6, name: 'Thiago Ruiz', documentNumber: '46111222', present: false },
      { id: 7, name: 'Martina Díaz', documentNumber: '45888999', present: true },
    ],
  },
  {
    id: 3,
    activity: 'Básquet',
    teacher: 'Juan Pérez',
    date: '2026-10-21',
    time: '18:00',
    students: [
      { id: 8, name: 'Benjamín Castro', documentNumber: '44999111', present: true },
      { id: 9, name: 'Emilia Romero', documentNumber: '45777666', present: false },
      { id: 10, name: 'Joaquín Silva', documentNumber: '46333555', present: true },
      { id: 11, name: 'Renata Herrera', documentNumber: '45222444', present: true },
    ],
  },
]

function formatDate(date) {
  if (!date) return '—'
  return new Date(`${date}T12:00:00`).toLocaleDateString('es-AR')
}

function AttendanceHistoryPage() {
  const [attendanceRecords] = useState(initialAttendanceRecords)
  const [searchTerm, setSearchTerm] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [attendanceFilter, setAttendanceFilter] = useState('all')
  const [selectedRecord, setSelectedRecord] = useState(null)

  const filteredRecords = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase()

    return attendanceRecords.filter((record) => {
      const matchesSearch =
        record.activity.toLowerCase().includes(normalizedSearch) ||
        record.teacher.toLowerCase().includes(normalizedSearch)

      const matchesStartDate = !startDate || record.date >= startDate
      const matchesEndDate = !endDate || record.date <= endDate

      const presentCount = record.students.filter((student) => student.present).length
      const absentCount = record.students.length - presentCount
      const matchesAttendance =
        attendanceFilter === 'all' ||
        (attendanceFilter === 'with-absences' && absentCount > 0) ||
        (attendanceFilter === 'full-attendance' && absentCount === 0)

      return matchesSearch && matchesStartDate && matchesEndDate && matchesAttendance
    })
  }, [attendanceRecords, searchTerm, startDate, endDate, attendanceFilter])

  const totals = useMemo(() => {
    return filteredRecords.reduce(
      (summary, record) => {
        const presentCount = record.students.filter((student) => student.present).length
        summary.sessions += 1
        summary.present += presentCount
        summary.absent += record.students.length - presentCount
        summary.students += record.students.length
        return summary
      },
      { sessions: 0, present: 0, absent: 0, students: 0 },
    )
  }, [filteredRecords])

  const clearFilters = () => {
    setSearchTerm('')
    setStartDate('')
    setEndDate('')
    setAttendanceFilter('all')
  }

  return (
    <section className="attendance-history-page">
      <div className="attendance-history-heading">
        <div>
          <h2>Historial de asistencia</h2>
          <p>Consultá las asistencias registradas en las actividades.</p>
        </div>
        <div className="attendance-history-heading-icon" aria-hidden="true">
          <ClipboardCheck size={25} />
        </div>
      </div>

      <div className="attendance-history-stats">
        <article className="attendance-history-stat">
          <span className="attendance-stat-icon"><CalendarDays size={20} /></span>
          <div><span>Clases registradas</span><strong>{totals.sessions}</strong></div>
        </article>
        <article className="attendance-history-stat">
          <span className="attendance-stat-icon attendance-stat-present"><UserCheck size={20} /></span>
          <div><span>Presentes</span><strong>{totals.present}</strong></div>
        </article>
        <article className="attendance-history-stat">
          <span className="attendance-stat-icon attendance-stat-absent"><UserX size={20} /></span>
          <div><span>Ausentes</span><strong>{totals.absent}</strong></div>
        </article>
        <article className="attendance-history-stat">
          <span className="attendance-stat-icon"><UsersRound size={20} /></span>
          <div><span>Alumnos registrados</span><strong>{totals.students}</strong></div>
        </article>
      </div>

      <div className="attendance-history-filters">
        <label className="attendance-history-search">
          <span>Buscar actividad o docente</span>
          <div className="attendance-history-input-wrap">
            <Search size={18} />
            <input
              type="search"
              placeholder="Ej. Fútbol Infantil"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </div>
        </label>

        <label>
          <span>Desde</span>
          <input type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} />
        </label>

        <label>
          <span>Hasta</span>
          <input type="date" value={endDate} min={startDate || undefined} onChange={(event) => setEndDate(event.target.value)} />
        </label>

        <label>
          <span>Asistencia</span>
          <select value={attendanceFilter} onChange={(event) => setAttendanceFilter(event.target.value)}>
            <option value="all">Todas</option>
            <option value="with-absences">Con ausentes</option>
            <option value="full-attendance">Todos presentes</option>
          </select>
        </label>

        <button type="button" className="attendance-history-clear" onClick={clearFilters}>
          <RotateCcw size={16} />
          Limpiar
        </button>
      </div>

      <div className="attendance-history-table-card">
        <div className="attendance-history-table-heading">
          <div>
            <h3>Registros de asistencia</h3>
            <p>{filteredRecords.length} {filteredRecords.length === 1 ? 'registro encontrado' : 'registros encontrados'}</p>
          </div>
        </div>

        {filteredRecords.length > 0 ? (
          <div className="attendance-history-table-scroll">
            <table className="attendance-history-table">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Actividad</th>
                  <th>Docente</th>
                  <th>Presentes</th>
                  <th>Ausentes</th>
                  <th>Total</th>
                  <th>Detalle</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map((record) => {
                  const presentCount = record.students.filter((student) => student.present).length
                  const absentCount = record.students.length - presentCount

                  return (
                    <tr key={record.id}>
                      <td><span className="attendance-history-date">{formatDate(record.date)}</span><small>{record.time} h</small></td>
                      <td><strong>{record.activity}</strong></td>
                      <td>{record.teacher}</td>
                      <td><span className="attendance-count attendance-count-present">{presentCount}</span></td>
                      <td><span className="attendance-count attendance-count-absent">{absentCount}</span></td>
                      <td>{record.students.length}</td>
                      <td>
                        <button
                          type="button"
                          className="attendance-history-details"
                          onClick={() => setSelectedRecord(record)}
                          aria-label={`Ver detalle de ${record.activity} del ${formatDate(record.date)}`}
                        >
                          <Eye size={16} />
                          Ver detalle
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="attendance-history-empty">
            <ClipboardCheck size={36} />
            <h3>No se encontraron registros</h3>
            <p>Probá cambiar los filtros para ver otras asistencias.</p>
            <button type="button" onClick={clearFilters}>Limpiar filtros</button>
          </div>
        )}
      </div>

      {selectedRecord && (
        <div className="attendance-modal-backdrop" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setSelectedRecord(null)
        }}>
          <section
            className="attendance-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="attendance-modal-title"
          >
            <div className="attendance-modal-header">
              <div>
                <span className="attendance-modal-eyebrow">Detalle de asistencia</span>
                <h2 id="attendance-modal-title">{selectedRecord.activity}</h2>
                <p>{formatDate(selectedRecord.date)} · {selectedRecord.time} h · {selectedRecord.teacher}</p>
              </div>
              <button type="button" className="attendance-modal-close" onClick={() => setSelectedRecord(null)} aria-label="Cerrar detalle">
                <X size={21} />
              </button>
            </div>

            <div className="attendance-modal-summary">
              <span><UserCheck size={17} /> {selectedRecord.students.filter((student) => student.present).length} presentes</span>
              <span><UserX size={17} /> {selectedRecord.students.filter((student) => !student.present).length} ausentes</span>
            </div>

            <div className="attendance-modal-table-wrap">
              <table className="attendance-modal-table">
                <thead><tr><th>Alumno/a</th><th>Documento</th><th>Estado</th></tr></thead>
                <tbody>
                  {selectedRecord.students.map((student) => (
                    <tr key={student.id}>
                      <td>{student.name}</td>
                      <td>{student.documentNumber}</td>
                      <td>
                        <span className={student.present ? 'attendance-status attendance-status-present' : 'attendance-status attendance-status-absent'}>
                          {student.present ? 'Presente' : 'Ausente'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="attendance-modal-footer">
              <button type="button" onClick={() => setSelectedRecord(null)}>Cerrar</button>
            </div>
          </section>
        </div>
      )}
    </section>
  )
}

export default AttendanceHistoryPage
