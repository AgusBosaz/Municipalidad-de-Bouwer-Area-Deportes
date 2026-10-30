import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, CalendarDays, ClipboardCheck } from 'lucide-react'
import { getMyAssignments } from '../services/assignmentService'
import { getAttendanceStudents } from '../services/attendanceService'
import { getSession } from '../services/AuthSession'
import '../styles/dashboard-teacher.css'

function DocenteInicioPage() {
  const nombre = getSession()?.name?.trim().split(/\s+/)[0] || 'Docente'
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

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

  const totalStudents = activities.reduce(
    (total, activity) => total + activity.studentsCount, 0,
  )

  return (
    <section className="docente-page">
      <div className="docente-welcome">
        <span className="docente-eyebrow">ÁREA DE DEPORTES Y RECREACIÓN</span>
        <h1>¡Hola, {nombre}!</h1>
        <p>
          Desde acá podés consultar tus actividades y registrar la asistencia.
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
    </section>
  )
}

export default DocenteInicioPage
