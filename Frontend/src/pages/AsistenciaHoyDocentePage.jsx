import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  CalendarCheck,
  CalendarDays,
  ClipboardCheck,
  History as HistoryIcon,
  UsersRound,
} from 'lucide-react'
import { getMyAssignments } from '../services/assignmentService'
import {
  getActivityAttendance,
  getAttendanceStudents,
} from '../services/attendanceService'
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

// Fecha de hoy en formato yyyy-mm-dd (hora local, no UTC).
function fechaLocal() {
  const ahora = new Date()
  return new Date(
    ahora.getTime() - ahora.getTimezoneOffset() * 60000,
  ).toISOString().slice(0, 10)
}

// Valor del día de hoy en el formato de ActivityDays (Lunes = 1 ... Domingo = 64).
// getDay() devuelve 0 para domingo, 1 para lunes, ..., 6 para sábado.
function valorDiaDeHoy() {
  const dia = new Date().getDay()
  return dia === 0 ? 64 : 2 ** (dia - 1)
}

// "Asistencia" del docente: va directo a tomar la lista de las clases de hoy,
// muestra si ya se registró y da acceso al historial.
function AsistenciaHoyDocentePage() {
  const hoy = fechaLocal()
  const textoHoy = new Date().toLocaleDateString('es-AR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })
  const [clasesHoy, setClasesHoy] = useState([])
  const [otrasActividades, setOtrasActividades] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    const load = async () => {
      try {
        const assignments = await getMyAssignments()
        const diaHoy = valorDiaDeHoy()

        const deHoy = assignments.filter((assignment) => (assignment.days & diaHoy) !== 0)
        const otras = assignments.filter((assignment) => (assignment.days & diaHoy) === 0)

        // Para las clases de hoy se consulta si ya hay asistencia cargada.
        const clases = await Promise.all(
          deHoy.map(async (assignment) => {
            const [students, records] = await Promise.all([
              getAttendanceStudents(assignment.activityId),
              getActivityAttendance(assignment.activityId, hoy),
            ])

            return {
              ...assignment,
              studentsCount: students.length,
              registrada: records.length > 0,
              presentes: records.filter((record) => record.isPresent).length,
            }
          }),
        )

        if (!active) return

        setClasesHoy(clases.sort((a, b) => a.startTime.localeCompare(b.startTime)))
        setOtrasActividades(otras)
      } catch {
        if (active) setError('No se pudieron cargar tus clases.')
      } finally {
        if (active) setLoading(false)
      }
    }

    load()
    return () => {
      active = false
    }
  }, [hoy])

  return (
    <section className="docente-page">
      <div className="docente-page-header docente-today-header">
        <div>
          <span className="docente-eyebrow">ASISTENCIA</span>
          <h1>Tomar asistencia</h1>
          <p>
            Hoy es <strong>{textoHoy}</strong>. Elegí una clase para tomar lista.
          </p>
        </div>
        <Link className="docente-outline-action docente-history-link" to="/attendance-history">
          <HistoryIcon size={17} />
          Ver historial de asistencia
        </Link>
      </div>

      {loading && <p role="status">Cargando clases de hoy...</p>}
      {error && <p role="alert">{error}</p>}

      {!loading && !error && (
        <>
          <div className="docente-section-heading">
            <div>
              <h2>Clases de hoy</h2>
              <p>Actividades asignadas que se dictan hoy según sus días.</p>
            </div>
          </div>

          {clasesHoy.length === 0 ? (
            <p className="docente-history-empty">
              Hoy no tenés clases programadas. Podés consultar tus otras actividades abajo.
            </p>
          ) : (
            <div className="docente-activity-grid">
              {clasesHoy.map((clase) => (
                <article className="docente-activity-card" key={clase.id}>
                  <div className="docente-activity-topline">
                    <span className="docente-activity-symbol"><CalendarCheck size={22} /></span>
                    <span
                      className={`docente-attendance-status ${clase.registrada ? 'is-done' : 'is-pending'}`}
                    >
                      {clase.registrada ? 'Lista tomada' : 'Pendiente'}
                    </span>
                  </div>
                  <span className="docente-card-label">CLASE DE HOY</span>
                  <h2>{clase.activityName}</h2>
                  <div className="docente-activity-details">
                    <p>
                      <CalendarDays size={16} />
                      <span>{clase.startTime.slice(0, 5)} a {clase.endTime.slice(0, 5)}</span>
                    </p>
                    <p>
                      <UsersRound size={16} />
                      <span>
                        {clase.registrada
                          ? `${clase.presentes} de ${clase.studentsCount} presentes`
                          : `${clase.studentsCount} alumnos inscriptos`}
                      </span>
                    </p>
                  </div>
                  <Link
                    className={clase.registrada ? 'docente-outline-action' : 'docente-solid-action'}
                    to={'/asistencia/' + clase.activityId}
                  >
                    {clase.registrada ? 'Ver o corregir la lista' : 'Tomar lista de hoy'}
                    <ArrowRight size={17} />
                  </Link>
                </article>
              ))}
            </div>
          )}

          {otrasActividades.length > 0 && (
            <>
              <div className="docente-section-heading">
                <div>
                  <h2>Otras actividades asignadas</h2>
                  <p>No tienen clase programada para hoy.</p>
                </div>
              </div>

              <ul className="docente-history-list">
                {otrasActividades.map((actividad) => (
                  <li className="docente-history-item docente-other-item" key={actividad.id}>
                    <span className="docente-history-icon" aria-hidden="true">
                      <ClipboardCheck size={20} />
                    </span>
                    <div className="docente-history-info">
                      <strong>{actividad.activityName}</strong>
                      <span>
                        {mostrarDias(actividad.days)} · {actividad.startTime.slice(0, 5)} a{' '}
                        {actividad.endTime.slice(0, 5)}
                      </span>
                    </div>
                    <Link
                      className="docente-text-link"
                      to={'/asistencia/' + actividad.activityId}
                    >
                      Tomar asistencia de hoy <ArrowRight size={15} />
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          )}
        </>
      )}
    </section>
  )
}

export default AsistenciaHoyDocentePage
