import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  CalendarDays,
  ClipboardCheck,
  Eye,
  History as HistoryIcon,
  PencilLine,
} from 'lucide-react'
import AttendanceDetailModal from '../components/AttendanceDetailModal'
import { getMyAssignments } from '../services/assignmentService'
import {
  formatAttendanceDate,
  getAttendanceHistoryByClass,
  getAttendanceStudents,
} from '../services/attendanceService'
import { getSession } from '../services/AuthSession'
import '../styles/dashboard-teacher.css'

// Cantidad de clases que se muestran en el inicio; el resto está en /attendance-history.
const CLASES_RECIENTES = 5

function DocenteInicioPage() {
  const nombre = getSession()?.name?.trim().split(/\s+/)[0] || 'Docente'
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Historial de asistencia del docente (el backend devuelve solo sus actividades).
  const [historial, setHistorial] = useState([])
  const [cargandoHistorial, setCargandoHistorial] = useState(true)
  const [errorHistorial, setErrorHistorial] = useState('')
  const [claseSeleccionada, setClaseSeleccionada] = useState(null) // { id, edit }

  useEffect(() => {
    let active = true

    getMyAssignments()
      .then((assignments) => Promise.all(
        assignments.map(async (assignment) => ({
          ...assignment,
          studentsCount: (await getAttendanceStudents(assignment.activityId)).length,
        })),
      ))
      .then((result) => {
        if (active) setActivities(result)
      })
      .catch(() => {
        if (active) setError('No se pudo cargar el inicio del docente.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    let active = true

    getAttendanceHistoryByClass()
      .then((result) => {
        if (active) setHistorial(result)
      })
      .catch(() => {
        if (active) setErrorHistorial('No se pudo cargar el historial de asistencia.')
      })
      .finally(() => {
        if (active) setCargandoHistorial(false)
      })

    return () => {
      active = false
    }
  }, [])

  async function recargarHistorial() {
    const result = await getAttendanceHistoryByClass()
    setHistorial(result)
  }

  const totalStudents = activities.reduce(
    (total, activity) => total + activity.studentsCount, 0,
  )

  const clasesRecientes = historial.slice(0, CLASES_RECIENTES)
  const claseAbierta = claseSeleccionada
    ? historial.find((clase) => clase.id === claseSeleccionada.id)
    : null

  return (
    <section className="docente-page">
      <div className="docente-welcome">
        <span className="docente-eyebrow">ÁREA DE DEPORTES Y RECREACIÓN</span>
        <h1>¡Hola, {nombre}!</h1>
        <p>
          Desde acá podés consultar tus actividades, registrar la asistencia y
          revisar el historial de tus clases.
        </p>
        <Link className="primary-button" to="/mis-actividades">
          Ver mis actividades <ArrowRight size={17} />
        </Link>
      </div>

      {loading && <p role="status">Cargando actividades...</p>}
      {error && <p role="alert">{error}</p>}
      {!loading && !error && (
        <>
          <div className="docente-stats">
            <article className="docente-stat-card">
              <span className="docente-stat-icon"><CalendarDays size={21} /></span>
              <div>
                <span>Actividades asignadas</span>
                <strong>{activities.length}</strong>
              </div>
            </article>
            <article className="docente-stat-card">
              <span className="docente-stat-icon"><ClipboardCheck size={21} /></span>
              <div>
                <span>Alumnos inscriptos</span>
                <strong>{totalStudents}</strong>
              </div>
            </article>
          </div>

          <div className="docente-section-heading">
            <div>
              <h2>Mis actividades</h2>
              <p>Accedé a una actividad para controlar la asistencia.</p>
            </div>
            <Link to="/mis-actividades">Ver todas</Link>
          </div>

          {activities.length === 0 ? (
            <p>Todavía no tenés actividades asignadas.</p>
          ) : (
            <div className="docente-activity-grid">
              {activities.map((activity) => (
                <article className="docente-activity-card" key={activity.id}>
                  <div className="docente-activity-symbol"><CalendarDays size={22} /></div>
                  <span className="docente-card-label">ACTIVIDAD ASIGNADA</span>
                  <h3>{activity.activityName}</h3>
                  <p>
                    {activity.startTime.slice(0, 5)} a {activity.endTime.slice(0, 5)}
                  </p>
                  <div className="docente-card-footer">
                    <span>{activity.studentsCount} alumnos inscriptos</span>
                    <Link
                      to={'/asistencia/' + activity.activityId}
                      aria-label={'Tomar asistencia de ' + activity.activityName}
                    >
                      <ArrowRight size={19} />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </>
      )}

      <div className="docente-section-heading docente-history-heading">
        <div>
          <h2>Historial de asistencia</h2>
          <p>Últimas clases registradas en las actividades que tenés asignadas actualmente. Podés ver o corregir la asistencia.</p>
        </div>
        <Link to="/attendance-history">Ver historial completo</Link>
      </div>

      {cargandoHistorial && <p role="status">Cargando historial...</p>}
      {errorHistorial && <p role="alert">{errorHistorial}</p>}
      {!cargandoHistorial && !errorHistorial && clasesRecientes.length === 0 && (
        <p className="docente-history-empty">
          Todavía no hay asistencias en tus actividades asignadas.
        </p>
      )}

      {!cargandoHistorial && !errorHistorial && clasesRecientes.length > 0 && (
        <ul className="docente-history-list">
          {clasesRecientes.map((clase) => {
            const presentes = clase.students.filter((student) => student.present).length
            const ausentes = clase.students.length - presentes

            return (
              <li className="docente-history-item" key={clase.id}>
                <span className="docente-history-icon" aria-hidden="true">
                  <HistoryIcon size={20} />
                </span>

                <div className="docente-history-info">
                  <strong>{clase.activityName}</strong>
                  <span>{formatAttendanceDate(clase.date)}</span>
                </div>

                <div className="docente-history-counts">
                  <span className="docente-history-chip is-present">
                    {presentes} {presentes === 1 ? 'presente' : 'presentes'}
                  </span>
                  <span className="docente-history-chip is-absent">
                    {ausentes} {ausentes === 1 ? 'ausente' : 'ausentes'}
                  </span>
                </div>

                <div className="docente-history-actions">
                  <button
                    type="button"
                    onClick={() => setClaseSeleccionada({ id: clase.id, edit: false })}
                  >
                    <Eye size={16} /> Ver
                  </button>
                  <button
                    type="button"
                    className="is-primary"
                    onClick={() => setClaseSeleccionada({ id: clase.id, edit: true })}
                    aria-label={`Editar asistencia de ${clase.activityName} del ${formatAttendanceDate(clase.date)}`}
                  >
                    <PencilLine size={16} /> Editar
                  </button>
                </div>
              </li>
            )
          })}
        </ul>
      )}

      {claseAbierta && (
        <AttendanceDetailModal
          key={claseAbierta.id}
          record={claseAbierta}
          startInEditMode={claseSeleccionada.edit}
          onClose={() => setClaseSeleccionada(null)}
          onSaved={recargarHistorial}
        />
      )}
    </section>
  )
}

export default DocenteInicioPage
