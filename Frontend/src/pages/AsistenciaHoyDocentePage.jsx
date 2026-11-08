import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, ClipboardCheck, History as HistoryIcon } from 'lucide-react'
import { getMyAssignments } from '../services/assignmentService'
import { canTakeAttendance } from '../services/attendanceService'
import '../styles/dashboard-teacher.css'

const diasSemana = [
  { abreviatura: 'Lu', valor: 1 },
  { abreviatura: 'Ma', valor: 2 },
  { abreviatura: 'Mi', valor: 4 },
  { abreviatura: 'Ju', valor: 8 },
  { abreviatura: 'Vi', valor: 16 },
  { abreviatura: 'Sa', valor: 32 },
  { abreviatura: 'Do', valor: 64 },
]

function mostrarDias(days) {
  const seleccionados = diasSemana.filter((dia) => (days & dia.valor) !== 0)
  return seleccionados.length
    ? seleccionados.map((dia) => dia.abreviatura).join(' - ')
    : 'Días a confirmar'
}

function AsistenciaHoyDocentePage() {
  const textoHoy = new Date().toLocaleDateString('es-AR', {
    timeZone: 'America/Argentina/Buenos_Aires', weekday: 'long', day: 'numeric', month: 'long',
  })
  const [actividades, setActividades] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [ahora, setAhora] = useState(() => new Date())

  useEffect(() => {
    const timer = window.setInterval(() => setAhora(new Date()), 15000)
    return () => window.clearInterval(timer)
  }, [])

  useEffect(() => {
    let active = true
    getMyAssignments()
      .then((asignaciones) => { if (active) setActividades(asignaciones) })
      .catch(() => { if (active) setError('No se pudieron cargar tus actividades.') })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])

  return (
    <section className="docente-page">
      <div className="docente-page-header docente-today-header">
        <div>
          <span className="docente-eyebrow">ASISTENCIA</span>
          <h1>Tomar asistencia</h1>
          <p>Hoy es <strong>{textoHoy}</strong>. Elegí una actividad para tomar asistencia.</p>
        </div>
        <Link className="docente-outline-action docente-history-link" to="/attendance-history">
          <HistoryIcon size={17} /> Ver historial de asistencia
        </Link>
      </div>
      {loading && <p role="status">Cargando actividades...</p>}
      {error && <p role="alert">{error}</p>}
      {!loading && !error && (
        <>
          <div className="docente-section-heading">
            <div>
              <h2>Actividades asignadas</h2>
              <p>Podés tomar asistencia durante el día y horario de cada actividad.</p>
            </div>
          </div>
          {actividades.length === 0 ? (
            <p className="docente-history-empty">Todavía no tenés actividades asignadas.</p>
          ) : (
            <ul className="docente-history-list">
              {actividades.map((actividad) => {
                const habilitada = canTakeAttendance(actividad, ahora)
                return (
                  <li className="docente-history-item docente-other-item" key={actividad.id}>
                    <span className="docente-history-icon" aria-hidden="true"><ClipboardCheck size={20} /></span>
                    <div className="docente-history-info">
                      <strong>{actividad.activityName}</strong>
                      <span>{mostrarDias(actividad.days)} · {actividad.startTime.slice(0, 5)} a{' '}
                        {actividad.endTime.slice(0, 5)}</span>
                    </div>
                    {habilitada ? (
                      <Link className="docente-text-link" to={'/asistencia/' + actividad.activityId}>
                        Tomar asistencia <ArrowRight size={15} />
                      </Link>
                    ) : (
                      <button className="docente-text-link docente-attendance-disabled" type="button" disabled title="Disponible durante el día y horario de la actividad">
                        Tomar asistencia <ArrowRight size={15} />
                      </button>
                    )}
                  </li>
                )
              })}
            </ul>
          )}
        </>
      )}
    </section>
  )
}

export default AsistenciaHoyDocentePage
