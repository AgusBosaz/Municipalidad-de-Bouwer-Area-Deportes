import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, CalendarDays, CheckCircle2, UsersRound } from 'lucide-react'
import { getSession } from '../services/AuthSession'
import { getMyAssignments } from '../services/assignmentService'
import { getActivityById } from '../services/activityService'
import {
  getAttendanceStudents,
  getActivityAttendance,
  saveActivityAttendance,
} from '../services/attendanceService'
import '../styles/Asistencia.css'
import '../styles/dashboard-teacher.css'

function fechaLocal() {
  const ahora = new Date()
  return new Date(
    ahora.getTime() - ahora.getTimezoneOffset() * 60000,
  ).toISOString().slice(0, 10)
}

function AsistenciaDocentePage() {
  const { actividadId } = useParams()
  const navigate = useNavigate()
  const isCoordinator = getSession()?.role === 'Coordinator'
  const backPath = isCoordinator ? '/asistencia' : '/mis-actividades'
  const [fecha, setFecha] = useState(fechaLocal)
  const [actividad, setActividad] = useState(null)
  const [alumnos, setAlumnos] = useState([])
  const [asistencia, setAsistencia] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [guardado, setGuardado] = useState(false)

  useEffect(() => {
    let active = true
    const load = async () => {
      setLoading(true)
      setError('')
      setGuardado(false)

      try {
        const activity = isCoordinator
          ? await getActivityById(actividadId)
          : (await getMyAssignments())
              .find((assignment) => assignment.activityId === Number(actividadId))

        if (!activity) {
          throw new Error('La actividad no está asignada a tu cuenta.')
        }

        const [students, records] = await Promise.all([
          getAttendanceStudents(actividadId),
          getActivityAttendance(actividadId, fecha),
        ])

        if (!active) return

        setActividad({
          name: isCoordinator ? activity.name : activity.activityName,
          startTime: activity.startTime,
          endTime: activity.endTime,
        })
        setAlumnos(students)
        setAsistencia(Object.fromEntries(
          records.map((record) => [record.studentActivityId, record.isPresent]),
        ))
      } catch {
        if (active) {
          setActividad(null)
          setError('No se pudo cargar la actividad o no tenés acceso a ella.')
        }
      } finally {
        if (active) setLoading(false)
      }
    }

    load()
    return () => {
      active = false
    }
  }, [actividadId, fecha, isCoordinator])

  const presentes = useMemo(
    () => alumnos.filter((alumno) => asistencia[alumno.studentActivityId]).length,
    [alumnos, asistencia],
  )

  async function guardarAsistencia() {
    if (!fecha || alumnos.length === 0 || !actividad) return

    const confirmar = window.confirm(
      '¿Confirmás guardar la asistencia de ' + actividad.name +
      ' del ' + fecha + '? Presentes: ' + presentes +
      ' de ' + alumnos.length + '.',
    )
    if (!confirmar) return

    setSaving(true)
    setError('')
    setGuardado(false)

    try {
      const entries = alumnos.map((alumno) => ({
        studentActivityId: alumno.studentActivityId,
        isPresent: Boolean(asistencia[alumno.studentActivityId]),
      }))
      await saveActivityAttendance(actividadId, fecha, entries)
      setGuardado(true)
    } catch {
      setError('No se pudo guardar la asistencia. Revisá la conexión e intentá de nuevo.')
    } finally {
      setSaving(false)
    }
  }

  function cancelar() {
    if (window.confirm('¿Querés salir y descartar los cambios de asistencia?')) {
      navigate(backPath)
    }
  }

  return (
    <section className="page asistencia-page">
      <div className="page-header">
        <div>
          <Link to={backPath} className="docente-back-link">
            <ArrowLeft size={16} /> Volver a actividades
          </Link>
          <h1>Tomar asistencia</h1>
          <p>Revisá los alumnos inscriptos y marcá quiénes asistieron.</p>
        </div>
      </div>

      {loading && <p role="status">Cargando alumnos y asistencia...</p>}
      {error && <p role="alert">{error}</p>}

      {!loading && actividad && (
        <section className="content-card asistencia-content-card">
          <div className="asistencia-activity-summary">
            <div className="docente-activity-symbol"><CalendarDays size={22} /></div>
            <div>
              <span className="docente-card-label">ACTIVIDAD</span>
              <h2>{actividad.name}</h2>
              <p>
                {actividad.startTime.slice(0, 5)} a{' '}
                {actividad.endTime.slice(0, 5)}
              </p>
            </div>
          </div>

          <div className="asistencia-meta-row">
            <div className="form-group">
              <label htmlFor="fecha-asistencia">Fecha de asistencia</label>
              <input
                id="fecha-asistencia"
                type="date"
                value={fecha}
                onChange={(event) => setFecha(event.target.value)}
                max={fechaLocal()}
                disabled={saving}
                required
              />
            </div>
            <div className="asistencia-count">
              <UsersRound size={18} />
              <span><strong>{alumnos.length}</strong> alumnos inscriptos</span>
            </div>
            <div className="asistencia-count">
              <CheckCircle2 size={18} />
              <span><strong>{presentes}</strong> presentes</span>
            </div>
          </div>

          <div className="docente-section-heading asistencia-heading">
            <div>
              <h2>Listado de alumnos</h2>
              <p>Marcá la casilla de los alumnos presentes.</p>
            </div>
            <span className="docente-total-pill">
              {presentes}/{alumnos.length} presentes
            </span>
          </div>

          {alumnos.length === 0 ? (
            <p>No hay alumnos inscriptos en esta actividad.</p>
          ) : (
            <div className="table-container asistencia-table">
              <table>
                <thead>
                  <tr><th>Alumno</th><th>DNI</th><th>Presente</th></tr>
                </thead>
                <tbody>
                  {alumnos.map((alumno) => (
                    <tr key={alumno.studentActivityId}>
                      <td>{alumno.firstName} {alumno.lastName}</td>
                      <td>{alumno.dni}</td>
                      <td className="asistencia-check-cell">
                        <label className="asistencia-checkbox-label">
                          <input
                            type="checkbox"
                            checked={Boolean(asistencia[alumno.studentActivityId])}
                            disabled={saving}
                            onChange={(event) => {
                              setAsistencia((current) => ({
                                ...current,
                                [alumno.studentActivityId]: event.target.checked,
                              }))
                              setGuardado(false)
                            }}
                            aria-label={'Marcar presente a ' + alumno.firstName + ' ' + alumno.lastName}
                          />
                          <span>
                            {asistencia[alumno.studentActivityId] ? 'Presente' : 'Ausente'}
                          </span>
                        </label>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {guardado && (
            <p className="asistencia-success" role="status">
              La asistencia quedó guardada en la base de datos.
            </p>
          )}
          <div className="form-actions asistencia-actions">
            <button type="button" className="secondary-button" onClick={cancelar}>
              Cancelar
            </button>
            <button
              type="button"
              className="primary-button"
              onClick={guardarAsistencia}
              disabled={loading || saving || alumnos.length === 0 || !fecha}
            >
              {saving ? 'Guardando...' : 'Guardar asistencia'}
            </button>
          </div>
        </section>
      )}
    </section>
  )
}

export default AsistenciaDocentePage
