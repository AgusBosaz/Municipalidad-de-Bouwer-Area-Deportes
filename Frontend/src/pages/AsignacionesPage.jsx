import { useEffect, useState } from 'react'
import { getActivities } from '../services/activityService'
import { getInstructors } from '../services/instructor-controller'
import {
  getAssignments,
  assignInstructor,
  unassignInstructor,
} from '../services/assignmentService'
import '../styles/asignaciones.css'

function mostrarDias(days) {
  const abreviaturas = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa', 'Do']
  const seleccionados = abreviaturas.filter((_, indice) => (days & (1 << indice)) !== 0)
  return seleccionados.length ? seleccionados.join(' - ') : 'Días a confirmar'
}

function AsignacionesPage() {
  const [actividad, setActividad] = useState('')
  const [docente, setDocente] = useState('')
  const [asignaciones, setAsignaciones] = useState([])
  const [actividades, setActividades] = useState([])
  const [docentes, setDocentes] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [guardando, setGuardando] = useState(false)
  const [eliminandoId, setEliminandoId] = useState(null)

  useEffect(() => {
    let active = true

    Promise.all([
      getActivities(),
      getInstructors(),
      getAssignments(),
    ])
      .then(([actividadesApi, docentesApi, asignacionesApi]) => {
        if (!active) return

        setActividades(actividadesApi)
        setDocentes(docentesApi)
        setAsignaciones(asignacionesApi)
      })
      .catch(() => {
        if (active) setError('No se pudieron cargar los datos de asignaciones.')
      })
      .finally(() => {
        if (active) setCargando(false)
      })

    return () => {
      active = false
    }
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!actividad || !docente || guardando) return

    setGuardando(true)

    try {
      const creada = await assignInstructor({
        activityId: Number(actividad),
        instructorId: Number(docente),
      })

      setAsignaciones((actuales) => [...actuales, creada])
      setActividad('')
      setDocente('')

      const avisos = creada.warnings?.length
        ? `\n\nAvisos:\n${creada.warnings.join('\n')}`
        : ''

      alert(`Asignación creada correctamente.${avisos}`)
    } catch (error) {
      let mensaje = ''

      try {
        mensaje = JSON.parse(error.message).message ?? ''
      } catch {
        mensaje = ''
      }

      alert(mensaje || 'No se pudo crear la asignación. Intentá nuevamente.')
    } finally {
      setGuardando(false)
    }
  }

  const handleDelete = async (id) => {
    if (eliminandoId !== null) return

    const confirmar = window.confirm(
      '¿Querés quitar esta asignación?'
    )

    if (!confirmar) return

    setEliminandoId(id)

    try {
      await unassignInstructor(id)

      setAsignaciones((actuales) =>
        actuales.filter((item) => item.id !== id)
      )
    } catch {
      alert('No se pudo quitar la asignación. Intentá nuevamente.')
    } finally {
      setEliminandoId(null)
    }
  }

  return (
    <section className="asignaciones-page">

      <div className="page-top">
        <div>
          <span className="page-eyebrow">GESTIÓN</span>
          <h2>Asignaciones</h2>
          <p>
            Asigná docentes a las diferentes actividades.
          </p>
        </div>
      </div>

      <div className="assignment-layout">

        <div className="assignment-form-card">

          <div className="assignment-card-header">
            <div className="assignment-number">
              01
            </div>

            <div>
              <h3>Nueva asignación</h3>
              <p>
                Seleccioná una actividad y un docente.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>

            <div className="form-group">
              <label>Actividad</label>

              <select
                value={actividad}
                onChange={(e) => setActividad(e.target.value)}
                disabled={cargando || Boolean(error)}
                required
              >
                <option value="">Seleccionar actividad</option>

                {actividades.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Docente</label>

              <select
                value={docente}
                onChange={(e) => setDocente(e.target.value)}
                disabled={cargando || Boolean(error)}
                required
              >
                <option value="">Seleccionar docente</option>

                {docentes.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.firstName} {item.lastName}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              className="primary-button assignment-submit"
              disabled={guardando || cargando || Boolean(error)}
            >
              {guardando ? 'Guardando...' : 'Crear asignación'}
            </button>

          </form>

        </div>

        <div className="assignment-list-card">

          <div className="assignment-list-header">

            <div>
              <span>ASIGNACIONES</span>
              <h3>Asignaciones actuales</h3>
            </div>

            <strong>
              {asignaciones.length}
            </strong>

          </div>

          <div className="assignment-list">
            {cargando ? (
              <p>Cargando asignaciones...</p>
            ) : error ? (
              <p role="alert">{error}</p>
            ) : asignaciones.length === 0 ? (
              <p>No hay asignaciones registradas.</p>
            ) : (
              asignaciones.map((item) => (
                <div className="assignment-item" key={item.id}>
                  <div className="assignment-avatar">
                    {item.instructorName?.charAt(0)}
                  </div>

                  <div className="assignment-info">
                    <strong>{item.instructorName}</strong>
                    <span>{item.activityName}</span>
                    <small>
                      {mostrarDias(item.days)} ·{' '}
                      {item.startTime?.slice(0, 5)} a {item.endTime?.slice(0, 5)}
                    </small>
                  </div>

                  <div className="assignment-actions">
                    <span className="status-badge status-active">Activa</span>
                    <button
                      type="button"
                      onClick={() => handleDelete(item.id)}
                      disabled={eliminandoId !== null}
                      aria-label={`Quitar asignación de ${item.instructorName} en ${item.activityName}`}
                    >
                      {eliminandoId === item.id ? 'Quitando...' : '⌫'}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

        </div>

      </div>

    </section>
  )
}

export default AsignacionesPage
