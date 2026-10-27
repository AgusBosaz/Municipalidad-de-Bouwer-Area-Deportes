import { Link } from 'react-router-dom'
import {
  ArrowRight,
  CalendarDays,
  UsersRound,
} from 'lucide-react'
import '../styles/Docente.css'

const actividades = [
  {
    id: '1',
    nombre: 'Fútbol Infantil',
    categoria: 'Deportes',
    dias: 'Lunes y miércoles',
    horario: '16:00 a 17:00 hs',
    lugar: 'Polideportivo Municipal',
    alumnos: 12,
  },
  {
    id: '2',
    nombre: 'Natación Adultos',
    categoria: 'Deportes',
    dias: 'Martes y jueves',
    horario: '09:00 a 10:00 hs',
    lugar: 'Pileta municipal',
    alumnos: 8,
  },
]

function MisActividadesPage() {
  return (
    <section className="docente-page">
      <div className="docente-page-header">
        <div>
          <span className="docente-eyebrow">
            MI ESPACIO
          </span>

          <h1>Mis actividades</h1>

          <p>
            Consultá las actividades que tenés asignadas
            y accedé al listado de alumnos.
          </p>
        </div>
      </div>

      <div className="docente-activity-grid">
        {actividades.map((actividad) => (
          <article
            className="docente-activity-card"
            key={actividad.id}
          >
            <div className="docente-activity-topline">
              <span className="docente-activity-symbol">
                <CalendarDays size={22} />
              </span>

              <span className="docente-assigned-badge">
                Asignada
              </span>
            </div>

            <span className="docente-card-label">
              {actividad.categoria}
            </span>

            <h2>{actividad.nombre}</h2>

            <div className="docente-activity-details">
              <p>
                <CalendarDays size={16} />
                {actividad.dias}, {actividad.horario}
              </p>

              <p>
                <UsersRound size={16} />
                {actividad.alumnos} alumnos inscriptos
              </p>
            </div>

            <p className="docente-location">
              {actividad.lugar}
            </p>

            <Link
              className="docente-outline-action"
              to={`/asistencia/${actividad.id}`}
            >
              Ver alumnos y tomar asistencia
              <ArrowRight size={17} />
            </Link>
          </article>
        ))}
      </div>

      <p className="docente-demo-note">
        Los datos mostrados son de ejemplo y todavía
        no están conectados a la API.
      </p>
    </section>
  )
}

export default MisActividadesPage