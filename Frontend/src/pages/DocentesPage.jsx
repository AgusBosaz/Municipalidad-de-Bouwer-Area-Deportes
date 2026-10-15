import { useState } from 'react'
import { createPortal } from 'react-dom'
import '../styles/docentes.css'

function DocentesPage() {
  const [modalOpen, setModalOpen] = useState(false)
  const [busqueda, setBusqueda] = useState('')

  const [docentes, setDocentes] = useState([
    {
      id: 1,
      nombre: 'Santiago Pérez',
      email: 'santi@correo.com',
      especialidad: 'Fútbol',
      estado: 'Activo'
    },
    {
      id: 2,
      nombre: 'María Gómez',
      email: 'maria@correo.com',
      especialidad: 'Natación',
      estado: 'Activo'
    },
    {
      id: 3,
      nombre: 'Lucía Torres',
      email: 'lucia@correo.com',
      especialidad: 'Yoga',
      estado: 'Activo'
    },
    {
      id: 4,
      nombre: 'Diego Castro',
      email: 'diego@correo.com',
      especialidad: 'Básquet',
      estado: 'Activo'
    }
  ])

  const [form, setForm] = useState({
    nombre: '',
    email: '',
    especialidad: '',
    estado: 'Activo'
  })

  const actualizarCampo = (e) => {
    const { name, value } = e.target

    setForm((actual) => ({
      ...actual,
      [name]: value
    }))
  }

  const abrirModal = () => {
    setForm({
      nombre: '',
      email: '',
      especialidad: '',
      estado: 'Activo'
    })

    setModalOpen(true)
  }

  const cerrarModal = () => {
    setModalOpen(false)
  }

  const guardarDocente = (e) => {
    e.preventDefault()

    const nombre = form.nombre.trim()
    const email = form.email.trim()

    if (!nombre) {
      alert('Ingresá el nombre del docente.')
      return
    }

    if (!email) {
      alert('Ingresá el email del docente.')
      return
    }

    const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    if (!emailValido.test(email)) {
      alert('Ingresá un email válido.')
      return
    }

    const emailExistente = docentes.some(
      (docente) =>
        docente.email.toLowerCase() === email.toLowerCase()
    )

    if (emailExistente) {
      alert('Ya existe un docente registrado con ese email.')
      return
    }

    if (!form.especialidad) {
      alert('Seleccioná una especialidad.')
      return
    }

    setDocentes((actuales) => [
      ...actuales,
      {
        id: Date.now(),
        nombre,
        email,
        especialidad: form.especialidad,
        estado: form.estado
      }
    ])

    cerrarModal()
  }

  const docentesFiltrados = docentes.filter((docente) =>
    `${docente.nombre} ${docente.email} ${docente.especialidad}`
      .toLowerCase()
      .includes(busqueda.toLowerCase())
  )

  return (
    <main className="page docentes-page">
      <div className="page-header">
        <div>
          <h1>Docentes</h1>
          <p>Gestioná los docentes del Área de Deportes.</p>
        </div>

        <div className="page-header-actions">
          <input
            type="text"
            className="search-input"
            placeholder="Buscar docente..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />

          <button
            type="button"
            className="primary-button"
            onClick={abrirModal}
          >
            + Nuevo
          </button>
        </div>
      </div>

      <section className="content-card">
        <div className="content-card-header">
          <div>
            <h2>Docentes registrados</h2>
            <p>Listado de docentes del Área de Deportes.</p>
          </div>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Email</th>
                <th>Especialidad</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>

            <tbody>
              {docentesFiltrados.map((docente) => (
                <tr key={docente.id}>
                  <td>{docente.nombre}</td>
                  <td>{docente.email}</td>
                  <td>{docente.especialidad}</td>

                  <td>
                    <span
                      className={`status-badge ${
                        docente.estado === 'Activo'
                          ? 'status-active'
                          : 'status-inactive'
                      }`}
                    >
                      {docente.estado}
                    </span>
                  </td>

                  <td>
                    <div className="table-actions">
                      <button
                        type="button"
                        className="action-button edit"
                        onClick={() =>
                          alert('La edición todavía no está implementada.')
                        }
                      >
                        Editar
                      </button>

                      <button
                        type="button"
                        className="action-button delete"
                        onClick={() => {
                          const confirmar = window.confirm(
                            `¿Querés eliminar a ${docente.nombre} de la lista local?`
                          )

                          if (confirmar) {
                            setDocentes((actuales) =>
                              actuales.filter(
                                (item) => item.id !== docente.id
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

              {docentesFiltrados.length === 0 && (
                <tr>
                  <td colSpan="5" className="docentes-empty">
                    No se encontraron docentes.
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
            className="docente-modal-overlay"
            onMouseDown={(e) => {
              if (e.target === e.currentTarget) {
                cerrarModal()
              }
            }}
          >
            <section
              className="docente-modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="docente-modal-title"
            >
              <button
                type="button"
                className="docente-modal-close"
                aria-label="Cerrar"
                onClick={cerrarModal}
              >
                ×
              </button>

              <div className="docente-modal-content">
                <div className="page-top">
                  <div>
                    <span className="page-eyebrow">DOCENTES</span>
                    <h2 id="docente-modal-title">Nuevo docente</h2>
                    <p>Completá los datos para registrar un docente.</p>
                  </div>
                </div>

                <form onSubmit={guardarDocente}>
                  <div className="form-section">
                    <div className="form-section-title">
                      <span>01</span>

                      <div>
                        <h3>Información del docente</h3>
                        <p>Datos principales del docente.</p>
                      </div>
                    </div>

                    <div className="form-grid">
                      <div className="form-group form-group-full">
                        <label htmlFor="docente-nombre">
                          Nombre completo
                        </label>

                        <input
                          id="docente-nombre"
                          type="text"
                          name="nombre"
                          value={form.nombre}
                          onChange={actualizarCampo}
                          placeholder="Ej. Juan Pérez"
                          maxLength={100}
                          required
                        />
                      </div>

                      <div className="form-group form-group-full">
                        <label htmlFor="docente-email">Email</label>

                        <input
                          id="docente-email"
                          type="email"
                          name="email"
                          value={form.email}
                          onChange={actualizarCampo}
                          placeholder="Ej. juan@correo.com"
                          maxLength={150}
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label htmlFor="docente-especialidad">
                          Especialidad
                        </label>

                        <select
                          id="docente-especialidad"
                          name="especialidad"
                          value={form.especialidad}
                          onChange={actualizarCampo}
                          required
                        >
                          <option value="">
                            Seleccionar especialidad
                          </option>
                          <option value="Fútbol">Fútbol</option>
                          <option value="Natación">Natación</option>
                          <option value="Yoga">Yoga</option>
                          <option value="Básquet">Básquet</option>
                          <option value="Vóley">Vóley</option>
                          <option value="Gimnasia">Gimnasia</option>
                          <option value="Otra">Otra</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label htmlFor="docente-estado">Estado</label>

                        <select
                          id="docente-estado"
                          name="estado"
                          value={form.estado}
                          onChange={actualizarCampo}
                        >
                          <option value="Activo">Activo</option>
                          <option value="Inactivo">Inactivo</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="form-actions">
                    <button
                      type="button"
                      className="secondary-button"
                      onClick={cerrarModal}
                    >
                      Cancelar
                    </button>

                    <button
                      type="submit"
                      className="primary-button"
                    >
                      Guardar docente
                    </button>
                  </div>
                </form>
              </div>
            </section>
          </div>,
          document.body
        )}
    </main>
  )
}

export default DocentesPage