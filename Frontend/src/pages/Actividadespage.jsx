import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { getAssignments, assignInstructor } from '../services/assignmentService'
import { getInstructors } from '../services/instructor-controller'
import { getActivities, createActivity, updateActivity, deleteActivity } from '../services/activityService'
import CrearActividadPage from './CrearActividadPage'
import ActivityStudentsModal from '../components/ActivityStudentsModal'
import '../styles/docentes.css'
import '../styles/actividades.css'

const categorias = {
  0: 'Niños',
  1: 'Adolescentes',
  2: 'Adultos mayores',
}

const diasSemana = [
  { nombre: 'Lunes', valor: 1 },
  { nombre: 'Martes', valor: 2 },
  { nombre: 'Miércoles', valor: 4 },
  { nombre: 'Jueves', valor: 8 },
  { nombre: 'Viernes', valor: 16 },
  { nombre: 'Sábado', valor: 32 },
  { nombre: 'Domingo', valor: 64 },
]

function mostrarDias(days) {
  const seleccionados = diasSemana
    .filter((dia) => (days & dia.valor) !== 0)
    .map((dia) => dia.nombre)

  return seleccionados.length > 0
    ? seleccionados.join(', ')
    : 'Sin días definidos'
}

function ActividadesPage() {
  const [modalOpen, setModalOpen] = useState(false)
  const [actividadEnEdicion, setActividadEnEdicion] = useState(null)
  const [actividadAlumnos, setActividadAlumnos] = useState(null)
  const [guardando, setGuardando] = useState(false)
  const [eliminandoId, setEliminandoId] = useState(null)
  const [actividades, setActividades] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [asignaciones, setAsignaciones] = useState([])
  const [errorAsignaciones, setErrorAsignaciones] = useState('')
  const [cargandoAsignaciones, setCargandoAsignaciones] = useState(true)
  const [docentes, setDocentes] = useState([])
  const [errorDocentes, setErrorDocentes] = useState('')
  const [cargandoDocentes, setCargandoDocentes] = useState(true)

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
        if (active) {
          setErrorAsignaciones('No se pudieron cargar los docentes asignados.')
        }
      })
      .finally(() => {
        if (active) setCargandoAsignaciones(false)
      })
    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    let active = true

    getInstructors()
      .then((data) => {
        if (active) setDocentes(data)
      })
      .catch(() => {
        if (active) setErrorDocentes('No se pudieron cargar los docentes.')
      })
      .finally(() => {
        if (active) setCargandoDocentes(false)
      })

    return () => {
      active = false
    }
  }, [])

  const [busqueda, setBusqueda] = useState('')

  const abrirNuevo = () => {
    setActividadEnEdicion(null)
    setModalOpen(true)
  }

  const abrirEdicion = (actividad) => {
    setActividadEnEdicion(actividad)
    setModalOpen(true)
  }

  const guardarActividad = async (datosActividad, docenteId) => {
    if (guardando) return

    setGuardando(true)

    const datosParaApi = {
      ...datosActividad,
      startTime: `${datosActividad.startTime}:00`,
      endTime: `${datosActividad.endTime}:00`,
    }

    try {
      if (actividadEnEdicion) {
        await updateActivity(actividadEnEdicion.id, datosParaApi)

        setActividades((actuales) =>
          actuales.map((actividad) =>
            actividad.id === actividadEnEdicion.id
              ? { ...actividad, ...datosParaApi }
              : actividad
          )
        )

        alert('La actividad fue actualizada correctamente.')
      } else {
        const creada = await createActivity(datosParaApi)

        setActividades((actuales) => [...actuales, creada])

        if (!docenteId) {
          alert('La actividad fue creada sin docente asignado.')
        } else {
          try {
            const asignacion = await assignInstructor({
              activityId: creada.id,
              instructorId: Number(docenteId),
            })

            setAsignaciones((actuales) => [...actuales, asignacion])

            const avisos = asignacion.warnings?.length
              ? `\n\nAvisos:\n${asignacion.warnings.join('\n')}`
              : ''

            alert(`Actividad creada y docente asignado.${avisos}`)
          } catch {
            try {
              const actualizadas = await getAssignments()
              setAsignaciones(actualizadas)
              setErrorAsignaciones('')
            } catch {
              setErrorAsignaciones('No se pudieron actualizar los docentes asignados.')
            }

            alert(
              'La actividad se creó, pero no se pudo confirmar la asignación. ' +
              'No vuelvas a crearla: revisá sus docentes asignados antes de reintentar.'
            )
          }
        }
      }

      setModalOpen(false)
      setActividadEnEdicion(null)
    } catch (error) {
      let mensaje = ''

      try {
        mensaje = JSON.parse(error.message).message ?? ''
      } catch {
        mensaje = ''
      }

      alert(mensaje || 'No se pudo guardar la actividad. Intentá nuevamente.')
    } finally {
      setGuardando(false)
    }
  }

  const darDeBajaActividad = async (actividad) => {
    if (eliminandoId !== null) return

    const confirmar = window.confirm(
      `¿Querés dar de baja la actividad "${actividad.name}"?`
    )

    if (!confirmar) return

    setEliminandoId(actividad.id)

    try {
      await deleteActivity(actividad.id)

      setActividades((actuales) =>
        actuales.filter((item) => item.id !== actividad.id)
      )

      alert('La actividad fue dada de baja correctamente.')
    } catch {
      alert('No se pudo dar de baja la actividad. Intentá nuevamente.')
    } finally {
      setEliminandoId(null)
    }
  }

  const actividadesFiltradas = actividades.filter((actividad) =>
    actividad.name.toLowerCase().includes(busqueda.toLowerCase())
  )

  return (
    <main className="page actividades-page">
      <div className="page-header">
        <div>
          <h1>Actividades</h1>
          <p>Gestioná las actividades del Área de Deportes y Recreación.</p>
        </div>

        <div className="page-header-actions">
          <input
            type="text"
            className="search-input"
            placeholder="Buscar actividad..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />

          <button
            type="button"
            className="primary-button"
            onClick={abrirNuevo}
          >
            + Nuevo
          </button>
        </div>
      </div>

      <section className="content-card">
        <div className="content-card-header">
          <div>
            <h2>Actividades registradas</h2>
            <p>Seleccioná una actividad para ver sus alumnos inscriptos.</p>
          </div>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Categoría</th>
                <th>Horario</th>
                <th>Lugar</th>
                <th>Cupos</th>
                <th>Docentes asignados</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>

            <tbody>
              {cargando ? (
                <tr>
                  <td colSpan="8">Cargando actividades...</td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan="8" role="alert">{error}</td>
                </tr>
              ) : actividadesFiltradas.length === 0 ? (
                <tr>
                  <td colSpan="8" className="activities-empty">
                    No se encontraron actividades.
                  </td>
                </tr>
              ) : (
                actividadesFiltradas.map((actividad) => (
                  <tr
                    key={actividad.id}
                    className="actividad-fila"
                    onClick={(event) => {
                      if (!event.target.closest('button, a, input, select, textarea')) {
                        setActividadAlumnos(actividad)
                      }
                    }}
                  >
                    <td>
                      <button
                        type="button"
                        className="actividad-nombre"
                        onClick={() => setActividadAlumnos(actividad)}
                        aria-label={`Ver alumnos de ${actividad.name}`}
                      >
                        {actividad.name}
                      </button>
                    </td>
                    <td>{categorias[actividad.category] ?? 'Sin categoría'}</td>
                    <td>
                      {mostrarDias(actividad.days)}
                      <br />
                      {actividad.startTime?.slice(0, 5)} a {actividad.endTime?.slice(0, 5)}
                    </td>
                    <td>{actividad.location || 'Sin lugar'}</td>
                    <td>{actividad.maximumCapacity}</td>
                    <td>
                      {cargandoAsignaciones
                        ? 'Cargando...'
                        : errorAsignaciones
                          ? 'No disponible'
                          : asignaciones
                            .filter((asignacion) => asignacion.activityId === actividad.id)
                            .map((asignacion) => asignacion.instructorName)
                            .join(', ') || 'Sin docente asignado'}
                    </td>
                    <td>
                      <span className="status-badge">Activa</span>
                    </td>
                    <td>
                      <div className="table-actions">
                        <button
                          type="button"
                          className="action-button edit"
                          onClick={() => abrirEdicion(actividad)}
                        >
                          Editar
                        </button>

                        <button
                          type="button"
                          className="action-button delete"
                          onClick={() => darDeBajaActividad(actividad)}
                          disabled={eliminandoId !== null}
                        >
                          {eliminandoId === actividad.id ? 'Dando de baja...' : 'Dar de baja'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {actividadAlumnos && (
        <ActivityStudentsModal
          activity={actividadAlumnos}
          onClose={() => setActividadAlumnos(null)}
        />
      )}

      {modalOpen &&
        createPortal(
          <div
            className="activity-modal-overlay"
            onMouseDown={(e) => {
              if (e.target === e.currentTarget) {
                setModalOpen(false)
              }
            }}
          >
            <section
              className="activity-modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="activity-modal-title"
            >
              <button
                type="button"
                className="activity-modal-close"
                aria-label="Cerrar"
                onClick={() => setModalOpen(false)}
              >
                ×
              </button>

              <CrearActividadPage
                actividadInicial={actividadEnEdicion}
                onCancel={() => setModalOpen(false)}
                onSave={guardarActividad}
                guardando={guardando}
                docentes={docentes}
                cargandoDocentes={cargandoDocentes}
                errorDocentes={errorDocentes}
              />
            </section>
          </div>,
          document.body
        )}
    </main>
  )
}

export default ActividadesPage
