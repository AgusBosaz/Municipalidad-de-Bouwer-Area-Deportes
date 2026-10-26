import { Link } from 'react-router-dom'
import {
  ArrowRight,
  CalendarDays,
  ClipboardCheck,
} from 'lucide-react'
import '../styles/Dashboard-teacher.css'


const actividades = [
  {
    id: '1',
    nombre: 'Fútbol Infantil',
    dia: 'Lunes y miércoles',
    horario: '16:00 a 17:00 hs',
    alumnos: 12,
  },
  {
    id: '2',
    nombre: 'Natación Adultos',
    dia: 'Martes y jueves',
    horario: '09:00 a 10:00 hs',
    alumnos: 8,
  },
]

function DocenteInicioPage({ session }) {
  const totalAlumnos = actividades.reduce(
    (total, actividad) => total + actividad.alumnos,
    0,
  )

  return (
    <section className="docente-page">
      <div className="docente-welcome">
        <span className="docente-eyebrow">
          ÁREA DE DEPORTES
        </span>

        <h1>
          ¡Hola, {session?.name?.split(' ')[0] || 'Docente'}!
        </h1>

        <p>
          Este es tu espacio de trabajo. Desde acá podés
          consultar tus actividades y registrar la asistencia.
        </p>

        <Link
          className="primary-button"
          to="/mis-actividades"
        >
          Ver mis actividades
          <ArrowRight size={17} />
        </Link>
      </div>

      <div className="docente-stats">
        <article className="docente-stat-card">
          <span className="docente-stat-icon">
            <CalendarDays size={21} />
          </span>

          <div>
            <span>Actividades asignadas</span>
            <strong>{actividades.length}</strong>
          </div>
        </article>

        <article className="docente-stat-card">
          <span className="docente-stat-icon">
            <ClipboardCheck size={21} />
          </span>

          <div>
            <span>Alumnos inscriptos</span>
            <strong>{totalAlumnos}</strong>
          </div>
        </article>
      </div>

      <div className="docente-section-heading">
        <div>
          <h2>Mis próximas actividades</h2>
          <p>
            Accedé a una actividad para controlar la asistencia.
          </p>
        </div>

        <Link to="/mis-actividades">
          Ver todas
        </Link>
      </div>

      <div className="docente-activity-grid">
        {actividades.map((actividad) => (
          <article
            className="docente-activity-card"
            key={actividad.id}
          >
            <div className="docente-activity-symbol">
              <CalendarDays size={22} />
            </div>

            <span className="docente-card-label">
              ACTIVIDAD ASIGNADA
            </span>

            <h3>{actividad.nombre}</h3>
            <p>{actividad.dia}</p>
            <p>{actividad.horario}</p>

            <div className="docente-card-footer">
              <span>
                {actividad.alumnos} alumnos inscriptos
              </span>

              <Link
                to={`/asistencia/${actividad.id}`}
                aria-label={`Tomar asistencia de ${actividad.nombre}`}
              >
                <ArrowRight size={19} />
              </Link>
            </div>
          </article>
        ))}
      </div>

      <p className="docente-demo-note">
        Datos de ejemplo para visualizar la interfaz.
      </p>
    </section>
  )
}

export default DocenteInicioPage
