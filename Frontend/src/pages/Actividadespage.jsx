import { useState } from 'react'
import { createPortal } from 'react-dom'
import '../styles/docentes.css'
import '../styles/actividades.css'
import CrearActividadPage from './CrearActividadPage'

function ActividadesPage() {
  const [modalOpen, setModalOpen] = useState(false)
  const [actividadEnEdicion, setActividadEnEdicion] = useState(null)

  const [actividades, setActividades] = useState([
    {
      id: 1,
      nombre: 'Fútbol Infantil',
      categoria: 'Deportes',
      horario: 'Lunes 16:00',
      estado: 'Activa'
    },
    {
      id: 2,
      nombre: 'Natación Adultos',
      categoria: 'Deportes',
      horario: 'Martes 09:00',
      estado: 'Activa'
    },
    {
      id: 3,
      nombre: 'Yoga',
      categoria: 'Bienestar',
      horario: 'Miércoles 18:00',
      estado: 'Activa'
    },
    {
      id: 4,
      nombre: 'Básquet Juvenil',
      categoria: 'Deportes',
      horario: 'Viernes 17:00',
      estado: 'Activa'
    }
  ])

  const [busqueda, setBusqueda] = useState('')

  const abrirNuevo = () => {
    setActividadEnEdicion(null)
    setModalOpen(true)
  }

  const abrirEdicion = (actividad) => {
    setActividadEnEdicion(actividad)
    setModalOpen(true)
  }

  const guardarActividad = (datosActividad) => {
    if (actividadEnEdicion !== null) {
      setActividades((actuales) =>
        actuales.map((actividad) =>
          actividad.id === actividadEnEdicion.id
            ? { ...actividad, ...datosActividad }
            : actividad
        )
      )
    } else {
      setActividades((actuales) => [
        ...actuales,
        {
          ...datosActividad,
          id: Date.now()
        }
      ])
    }

    setModalOpen(false)
  }

  const actividadesFiltradas = actividades.filter((actividad) =>
    actividad.nombre.toLowerCase().includes(busqueda.toLowerCase())
  )

  return (
    <main className="page actividades-page">
      <div className="page-header">
        <div>
          <h1>Actividades</h1>
          <p>Gestioná las actividades del Área de Deportes.</p>
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
            <p>Listado de actividades del Área de Deportes.</p>
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
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>

            <tbody>
              {actividadesFiltradas.map((actividad) => (
                <tr key={actividad.id}>
                  <td>{actividad.nombre}</td>
                  <td>{actividad.categoria}</td>
                  <td>{actividad.horario || 'Sin horario'}</td>
                  <td>{actividad.lugar || 'Sin lugar'}</td>
                  <td>{actividad.cupos ?? 'Sin definir'}</td>
                  <td>
                    <span className="status-badge">
                      {actividad.estado}
                    </span>
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
                        onClick={() => {
                          const confirmar = window.confirm(
                            '¿Querés eliminar esta actividad de la lista local?'
                          )

                          if (confirmar) {
                            setActividades((actuales) =>
                              actuales.filter(
                                (item) => item.id !== actividad.id
                              )
                            )
                          }
                        }}
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {actividadesFiltradas.length === 0 && (
                <tr>
                  <td colSpan="7" className="activities-empty">
                    No se encontraron actividades.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

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
              />
            </section>
          </div>,
          document.body
        )}
    </main>
  )
}

export default ActividadesPage
