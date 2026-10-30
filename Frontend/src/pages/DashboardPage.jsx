import { Link } from 'react-router-dom'
import { ArrowRight, CalendarDays, Trophy, UsersRound } from 'lucide-react'
import { useEffect, useState } from 'react'
import { getActivities } from '../services/activityService'
import { getSession } from '../services/AuthSession'
import { getAssignments } from '../services/assignmentService'

import '../styles/dashboard.css'

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
  const dias = diasSemana.filter((dia) => (days & dia.valor) !== 0)
  return dias.length ? dias : null
}

function DashboardPage() {
  const [actividades, setActividades] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const nombreCompleto = getSession()?.name?.trim() || ''
  const nombre = nombreCompleto.split(/\s+/)[0] || 'Coordinador'
  const [asignaciones, setAsignaciones] = useState([])
  const [cargandoAsignaciones, setCargandoAsignaciones] = useState(true)
  const [errorAsignaciones, setErrorAsignaciones] = useState('')

  useEffect(() => {
    let active = true

    getActivities()
      .then((data) => {
        if (active) setActividades(data)
      })
      .catch(() => {
        if (active) setError('No se pudieron cargar las actividades.')
      })
      .finally(() => {
        if (active) setCargando(false)
      })

    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    let active = true

    getAssignments()
      .then((data) => {
        if (active) setAsignaciones(data)
      })
      .catch(() => {
        if (active) setErrorAsignaciones('No se pudieron cargar los docentes.')
      })
      .finally(() => {
        if (active) setCargandoAsignaciones(false)
      })

    return () => {
      active = false
    }
  }, [])
  return (
    <main className="dashboard">

      <section className="dashboard-header">
        <h1>
          Hola, {nombre}
        </h1>

        <p>
          ¿Qué querés hacer hoy?
        </p>
      </section>

      <section className="dashboard-main-cards">

        <Link
          to="/docentes"
          className="dashboard-action-card"
        >
          <div className="dashboard-card-icon" aria-hidden="true">
            <UsersRound size={22} strokeWidth={1.8} />
          </div>

          <div>
            <h2>
              Docentes
            </h2>

            <p>
              Gestionar docentes
              <br />
              del centro
            </p>
          </div>

          <span className="dashboard-arrow" aria-hidden="true">
            <ArrowRight size={20} strokeWidth={1.8} />
          </span>
        </Link>

        <Link
          to="/actividades"
          className="dashboard-action-card"
        >
          <div className="dashboard-card-icon" aria-hidden="true">
            <Trophy size={22} strokeWidth={1.8} />
          </div>

          <div>
            <h2>
              Actividades
            </h2>

            <p>
              Gestionar actividades
              <br />
              del centro
            </p>
          </div>

          <span className="dashboard-arrow" aria-hidden="true">
            <ArrowRight size={20} strokeWidth={1.8} />
          </span>
        </Link>

        <Link
          to="/asignaciones"
          className="dashboard-action-card"
        >
          <div className="dashboard-card-icon" aria-hidden="true">
            <CalendarDays size={22} strokeWidth={1.8} />
          </div>

          <div>
            <h2>
              Asignaciones
            </h2>

            <p>
              Asignar docentes
              <br />
              a actividades
            </p>
          </div>

          <span className="dashboard-arrow" aria-hidden="true">
            <ArrowRight size={20} strokeWidth={1.8} />
          </span>
        </Link>

        <div className="dashboard-total-card">
          <div>
            <h2>
              Actividades activas
            </h2>

            <strong>
              {cargando ? '...' : error ? '—' : actividades.length}
            </strong>
          </div>

          <div className="dashboard-total-icon">
            ▣
          </div>
        </div>

      </section>

      <section className="dashboard-recent">

        <div className="dashboard-section-header">
          <div>
            <h2>
              Actividades activas
            </h2>

            <p>
              Algunas actividades del Área de Deportes y Recreación
            </p>
          </div>

          <Link to="/actividades">
            Ver todas
          </Link>
        </div>

        <div className="dashboard-recent-card">
          <div className="dashboard-recent-head">
            <span>Actividad</span>
            <span>Docente</span>
            <span>Horario</span>
            <span>Acción</span>
          </div>

          {cargando ? (
            <p className="dashboard-recent-message" role="status">Cargando actividades...</p>
          ) : error ? (
            <p className="dashboard-recent-message" role="alert">{error}</p>
          ) : actividades.length === 0 ? (
            <p className="dashboard-recent-message">No hay actividades activas.</p>
          ) : (
            actividades.slice(0, 4).map((actividad) => (
              <div className="dashboard-recent-row" key={actividad.id}>
                <span>{actividad.name}</span>

                <span>
                  {cargandoAsignaciones
                    ? 'Cargando...'
                    : errorAsignaciones
                      ? 'No disponible'
                      : asignaciones
                        .filter((item) => item.activityId === actividad.id)
                        .map((item) => item.instructorName)
                        .join(', ') || 'Sin docente asignado'}
                </span>

                <span>
                  {mostrarDias(actividad.days) ? (
                    <span
                      className="dashboard-activity-days"
                      aria-label={mostrarDias(actividad.days).map((dia) => dia.nombre).join(', ')}
                      title={mostrarDias(actividad.days).map((dia) => dia.nombre).join(', ')}
                    >
                      {mostrarDias(actividad.days).map((dia) => dia.abreviatura).join(' - ')}
                    </span>
                  ) : (
                    <span className="dashboard-activity-days">Días a confirmar</span>
                  )}
                  {actividad.startTime?.slice(0, 5)} a {actividad.endTime?.slice(0, 5)}
                </span>

                <Link
                  to="/actividades"
                  aria-label={`Ir a actividades para consultar ${actividad.name}`}
                >
                  →
                </Link>
              </div>
            ))
          )}
        </div>

      </section>

    </main>
  )
}

export default DashboardPage
