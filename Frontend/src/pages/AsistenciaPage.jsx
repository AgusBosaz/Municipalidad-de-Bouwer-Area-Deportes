import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, CalendarDays } from 'lucide-react'
import { getActivities } from '../services/activityService'
import '../styles/docentes.css'
import '../styles/Asistencia.css'
import '../styles/dashboard-teacher.css'

function AsistenciaPage() {
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    getActivities()
      .then((result) => {
        if (active) setActivities(result)
      })
      .catch(() => {
        if (active) setError('No se pudieron cargar las actividades.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  return (
    <main className="page asistencia-page">
      <div className="page-header">
        <div>
          <h1>Asistencia</h1>
          <p>Seleccioná una actividad para consultar alumnos y registrar asistencia.</p>
        </div>
      </div>

      <section className="content-card">
        <div className="content-card-header">
          <div>
            <h2>Actividades disponibles</h2>
            <p>Se muestran las actividades activas registradas en la base.</p>
          </div>
        </div>

        {loading && <p role="status">Cargando actividades...</p>}
        {error && <p role="alert">{error}</p>}
        {!loading && !error && activities.length === 0 && (
          <p>No hay actividades activas.</p>
        )}

        {!loading && !error && activities.length > 0 && (
          <div className="docente-activity-grid">
            {activities.map((activity) => (
              <article className="docente-activity-card" key={activity.id}>
                <div className="docente-activity-topline">
                  <span className="docente-activity-symbol"><CalendarDays size={22} /></span>
                  <span className="docente-assigned-badge">Activa</span>
                </div>
                <h3>{activity.name}</h3>
                <div className="docente-activity-details">
                  <p><CalendarDays size={16} /> {activity.startTime.slice(0, 5)} a{' '}
                    {activity.endTime.slice(0, 5)}</p>
                </div>
                <Link className="docente-outline-action" to={'/asistencia/' + activity.id}>
                  Ver alumnos y tomar asistencia
                  <ArrowRight size={17} />
                </Link>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}

export default AsistenciaPage
