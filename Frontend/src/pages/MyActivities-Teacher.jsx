import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ArrowRight, CalendarDays, UsersRound } from 'lucide-react'
import { getMyAssignments } from '../services/assignmentService'
import { getAttendanceStudents } from '../services/attendanceService'
import '../styles/dashboard-teacher.css'

const diasSemana = [
  { nombre: 'Lunes', abreviatura: 'Lu', valor: 1 },
  { nombre: 'Martes', abreviatura: 'Ma', valor: 2 },
  { nombre: 'Miércoles', abreviatura: 'Mi', valor: 4 },
  { nombre: 'Jueves', abreviatura: 'Ju', valor: 8 },
  { nombre: 'Viernes', abreviatura: 'Vi', valor: 16 },
  { nombre: 'Sábado', abreviatura: 'Sa', valor: 32 },
  { nombre: 'Domingo', abreviatura: 'Do', valor: 64 },
]

function mostrarDias(days) {
  const seleccionados = diasSemana.filter((dia) => (days & dia.valor) !== 0)
  return seleccionados.length
    ? seleccionados.map((dia) => dia.abreviatura).join(' - ')
    : 'Días a confirmar'
}

function MisActividadesPage() {
  const { pathname } = useLocation()
  const desdeAsistencia = pathname === '/asistencia'
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
        if (active) setError('No se pudieron cargar tus actividades.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  return (
    <section className="docente-page">
      <div className="docente-page-header">
        <span className="docente-eyebrow">MI ESPACIO</span>
        <h1>Mis actividades</h1>
        <p>Consultá las actividades que tenés asignadas y accedé al listado de alumnos.</p>
      </div>

      {loading && <p role="status">Cargando actividades...</p>}
      {error && <p role="alert">{error}</p>}
      {!loading && !error && activities.length === 0 && (
        <p>Todavía no tenés actividades asignadas.</p>
      )}

      {!loading && !error && (
        <div className="docente-activity-grid">
          {activities.map((activity) => (
            <article className="docente-activity-card" key={activity.id}>
              <div className="docente-activity-topline">
                <span className="docente-activity-symbol"><CalendarDays size={22} /></span>
                <span className="docente-assigned-badge">Asignada</span>
              </div>
              <span className="docente-card-label">ACTIVIDAD ASIGNADA</span>
              <h2>{activity.activityName}</h2>
              <div className="docente-activity-details">
                <p>
                  <CalendarDays size={16} />
                  <span>{mostrarDias(activity.days)} · {activity.startTime.slice(0, 5)} a {activity.endTime.slice(0, 5)}</span>
                </p>
                <p>
                  <UsersRound size={16} />
                  {activity.studentsCount} alumnos inscriptos
                </p>
              </div>
              <Link
                className="docente-outline-action"
                to={desdeAsistencia
                  ? '/asistencia/' + activity.activityId
                  : '/mis-actividades/' + activity.activityId + '/asistencia'}
              >
                Ver alumnos y tomar asistencia
                <ArrowRight size={17} />
              </Link>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}

export default MisActividadesPage
