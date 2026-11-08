import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  ArrowRight,
  CalendarDays,
  Clock3,
  MapPin,
  Tag,
  UsersRound,
} from 'lucide-react'
import ActivityStudentsModal from '../components/ActivityStudentsModal'
import AsistenciaHoyDocentePage from './AsistenciaHoyDocentePage'
import { getMyAssignments } from '../services/assignmentService'
import { getPublicActivities } from '../services/activityService'
import { canTakeAttendance, getAttendanceStudents } from '../services/attendanceService'
import '../styles/actividades.css'
import '../styles/dashboard-teacher.css'

const diasSemana = [
  { nombre: 'Lunes', valor: 1 },
  { nombre: 'Martes', valor: 2 },
  { nombre: 'Miércoles', valor: 4 },
  { nombre: 'Jueves', valor: 8 },
  { nombre: 'Viernes', valor: 16 },
  { nombre: 'Sábado', valor: 32 },
  { nombre: 'Domingo', valor: 64 },
]

const categorias = {
  0: 'Niños',
  1: 'Adolescentes',
  2: 'Adultos mayores',
}

function mostrarDias(days) {
  const seleccionados = diasSemana
    .filter((dia) => (days & dia.valor) !== 0)
    .map((dia) => dia.nombre)

  return seleccionados.length
    ? seleccionados.join(', ')
    : 'Días a confirmar'
}

// "Mis actividades": información de cada clase asignada (días, horario, lugar,
// categoría y alumnos inscriptos). La toma de lista está en "Asistencia".
function MisActividadesInfo() {
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actividadAlumnos, setActividadAlumnos] = useState(null)
  const [ahora, setAhora] = useState(() => new Date())

  useEffect(() => {
    const timer = window.setInterval(() => setAhora(new Date()), 15000)
    return () => window.clearInterval(timer)
  }, [])

  useEffect(() => {
    let active = true

    const load = async () => {
      try {
        const assignments = await getMyAssignments()

        // Lugar, categoría y cupos salen del listado público de actividades.
        // Si falla, la pantalla se muestra igual sin esos datos.
        let detalles = []
        try {
          detalles = await getPublicActivities()
        } catch {
          detalles = []
        }

        const result = await Promise.all(
          assignments.map(async (assignment) => {
            const detalle = detalles.find(
              (activity) => activity.id === assignment.activityId,
            )

            return {
              ...assignment,
              location: detalle?.location ?? null,
              category: detalle?.category ?? null,
              maximumCapacity: detalle?.maximumCapacity ?? null,
              studentsCount: (await getAttendanceStudents(assignment.activityId)).length,
            }
          }),
        )

        if (active) setActivities(result)
      } catch {
        if (active) setError('No se pudieron cargar tus actividades.')
      } finally {
        if (active) setLoading(false)
      }
    }

    load()
    return () => {
      active = false
    }
  }, [])

  return (
    <section className="docente-page">
      <div className="docente-page-header">
        <span className="docente-eyebrow">MI ESPACIO</span>
        <h1>Mis actividades</h1>
        <p>Consultá la información de las clases que tenés asignadas y sus alumnos inscriptos.</p>
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

              <dl className="docente-info-list">
                <div>
                  <dt><CalendarDays size={16} /> Días</dt>
                  <dd>{mostrarDias(activity.days)}</dd>
                </div>
                <div>
                  <dt><Clock3 size={16} /> Horario</dt>
                  <dd>{activity.startTime.slice(0, 5)} a {activity.endTime.slice(0, 5)}</dd>
                </div>
                <div>
                  <dt><MapPin size={16} /> Lugar</dt>
                  <dd>{activity.location || 'Sin lugar definido'}</dd>
                </div>
                {activity.category !== null && (
                  <div>
                    <dt><Tag size={16} /> Categoría</dt>
                    <dd>{categorias[activity.category] ?? 'Sin categoría'}</dd>
                  </div>
                )}
                <div>
                  <dt><UsersRound size={16} /> Alumnos</dt>
                  <dd>
                    {activity.studentsCount} inscriptos
                    {activity.maximumCapacity
                      ? ` de ${activity.maximumCapacity} cupos`
                      : ''}
                  </dd>
                </div>
              </dl>

              <div className="docente-card-actions">
                <button
                  type="button"
                  className="docente-outline-action"
                  onClick={() => setActividadAlumnos({
                    id: activity.activityId,
                    name: activity.activityName,
                  })}
                >
                  Ver alumnos inscriptos
                  <UsersRound size={17} />
                </button>
                {canTakeAttendance(activity, ahora) ? (
                  <Link className="docente-outline-action" to={'/mis-actividades/' + activity.activityId + '/asistencia'}>
                    Tomar asistencia <ArrowRight size={15} />
                  </Link>
                ) : (
                  <button type="button" className="docente-outline-action docente-card-disabled" disabled title="Disponible durante el día y horario de la actividad">
                    Tomar asistencia <ArrowRight size={15} />
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>
      )}

      {actividadAlumnos && (
        <ActivityStudentsModal
          activity={actividadAlumnos}
          onClose={() => setActividadAlumnos(null)}
        />
      )}
    </section>
  )
}

// El menú del docente tiene dos entradas que usan este mismo componente
// (App.jsx: /mis-actividades y /asistencia). Para no modificar App.jsx,
// acá se decide qué vista mostrar según la URL.
function MisActividadesPage() {
  const { pathname } = useLocation()

  return pathname === '/asistencia'
    ? <AsistenciaHoyDocentePage />
    : <MisActividadesInfo />
}

export default MisActividadesPage
