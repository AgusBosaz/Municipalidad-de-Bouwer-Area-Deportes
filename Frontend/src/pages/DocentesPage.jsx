import { useState } from 'react'
import { createPortal } from 'react-dom'
import '../styles/docentes.css'

function DocentesPage() {
  const [modalOpen, setModalOpen] = useState(false)
  const [docenteEnEdicion, setDocenteEnEdicion] = useState(null)
  const [busqueda, setBusqueda] = useState('')
  const [mensaje, setMensaje] = useState('')

  const [docentes, setDocentes] = useState([
    { id: 1, firstName: 'Santiago', lastName: 'Pérez', nombre: 'Santiago Pérez', dni: '30111222', gender: 'Masculino', phoneNumber: '3511111111', address: 'Bouwer', birthDate: '1990-01-15', email: 'santi@correo.com', specialty: 'Fútbol', especialidad: 'Fútbol', estado: 'Activo' },
    { id: 2, firstName: 'María', lastName: 'Gómez', nombre: 'María Gómez', dni: '30222333', gender: 'Femenino', phoneNumber: '3512222222', address: 'Bouwer', birthDate: '1991-04-20', email: 'maria@correo.com', specialty: 'Natación', especialidad: 'Natación', estado: 'Activo' },
    { id: 3, firstName: 'Lucía', lastName: 'Torres', nombre: 'Lucía Torres', dni: '30333444', gender: 'Femenino', phoneNumber: '3513333333', address: 'Bouwer', birthDate: '1992-07-10', email: 'lucia@correo.com', specialty: 'Yoga', especialidad: 'Yoga', estado: 'Activo' },
    { id: 4, firstName: 'Diego', lastName: 'Castro', nombre: 'Diego Castro', dni: '30444555', gender: 'Masculino', phoneNumber: '3514444444', address: 'Bouwer', birthDate: '1989-11-08', email: 'diego@correo.com', specialty: 'Básquet', especialidad: 'Básquet', estado: 'Activo' }
  ])

  const formularioVacio = {
    firstName: '',
    lastName: '',
    dni: '',
    gender: '',
    phoneNumber: '',
    address: '',
    birthDate: '',
    email: '',
    specialty: '',
    estado: 'Activo'
  }

  const [form, setForm] = useState(formularioVacio)

  const actualizarCampo = (e) => {
    const { name, value } = e.target
    setForm((actual) => ({ ...actual, [name]: value }))
    setMensaje('')
  }

  const abrirModal = () => {
    setDocenteEnEdicion(null)
    setForm({ ...formularioVacio })
    setMensaje('')
    setModalOpen(true)
  }

  const abrirEdicion = (docente) => {
    setDocenteEnEdicion(docente.id)
    setForm({
      firstName: docente.firstName,
      lastName: docente.lastName,
      dni: docente.dni,
      gender: docente.gender,
      phoneNumber: docente.phoneNumber,
      address: docente.address,
      birthDate: docente.birthDate,
      email: docente.email,
      specialty: docente.specialty,
      estado: docente.estado
    })
    setMensaje('')
    setModalOpen(true)
  }

  const cerrarModal = () => {
    setModalOpen(false)
    setDocenteEnEdicion(null)
    setMensaje('')
  }

  const guardarDocente = (e) => {
    e.preventDefault()

    const nombre = form.firstName.trim()
    const apellido = form.lastName.trim()
    const dni = form.dni.trim()
    const email = form.email.trim()
    const telefono = form.phoneNumber.trim()
    const direccion = form.address.trim()

    if (
      !nombre || !apellido || !dni || !email || !telefono ||
      !direccion || !form.birthDate || !form.gender || !form.specialty
    ) {
      setMensaje('Completá todos los campos obligatorios.')
      return
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setMensaje('Ingresá un email válido.')
      return
    }

    if (new Date(`${form.birthDate}T00:00:00`) > new Date()) {
      setMensaje('La fecha de nacimiento no puede ser futura.')
      return
    }

    if (docentes.some((d) =>
      d.id !== docenteEnEdicion && d.email.toLowerCase() === email.toLowerCase())) {
      setMensaje('Ya existe un docente registrado con ese email.')
      return
    }

    if (docentes.some((d) => d.id !== docenteEnEdicion && d.dni === dni)) {
      setMensaje('Ya existe un docente registrado con ese DNI.')
      return
    }

    const datosDocente = {
      firstName: nombre,
      lastName: apellido,
      nombre: `${nombre} ${apellido}`,
      dni,
      gender: form.gender,
      phoneNumber: telefono,
      address: direccion,
      birthDate: form.birthDate,
      email,
      specialty: form.specialty,
      especialidad: form.specialty,
      estado: form.estado
    }

    if (docenteEnEdicion !== null) {
      setDocentes((actuales) => actuales.map((docente) =>
        docente.id === docenteEnEdicion
          ? { ...docente, ...datosDocente }
          : docente
      ))
    } else {
      setDocentes((actuales) => [
        ...actuales,
        { id: Date.now(), ...datosDocente }
      ])
    }

    cerrarModal()
    alert(docenteEnEdicion !== null
      ? 'Docente actualizado en la lista local correctamente.'
      : 'Docente agregado a la lista local correctamente.')
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
          <button type="button" className="primary-button" onClick={abrirModal}>
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
                    <span className={`status-badge ${docente.estado === 'Activo' ? 'status-active' : 'status-inactive'}`}>
                      {docente.estado}
                    </span>
                  </td>
                  <td>
                    <div className="table-actions">
                      <button
                        type="button"
                        className="action-button edit"
                        onClick={() => abrirEdicion(docente)}
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        className="action-button delete"
                        onClick={() => {
                          if (window.confirm(`¿Querés eliminar a ${docente.nombre} de la lista local?`)) {
                            setDocentes((actuales) =>
                              actuales.filter((item) => item.id !== docente.id)
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

      {modalOpen && createPortal(
        <div
          className="docente-modal-overlay"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) cerrarModal()
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
                  <h2 id="docente-modal-title">
                    {docenteEnEdicion !== null ? 'Editar docente' : 'Nuevo docente'}
                  </h2>
                  <p>Completá los datos del docente.</p>
                </div>
              </div>

              <form onSubmit={guardarDocente}>
                <div className="form-section">
                  <div className="form-section-title">
                    <span>01</span>
                    <div>
                      <h3>Información personal</h3>
                      <p>Datos principales del docente.</p>
                    </div>
                  </div>

                  <div className="form-grid">
                    <div className="form-group">
                      <label htmlFor="docente-nombre">Nombre *</label>
                      <input id="docente-nombre" name="firstName" value={form.firstName} onChange={actualizarCampo} maxLength={100} required />
                    </div>

                    <div className="form-group">
                      <label htmlFor="docente-apellido">Apellido *</label>
                      <input id="docente-apellido" name="lastName" value={form.lastName} onChange={actualizarCampo} maxLength={100} required />
                    </div>

                    <div className="form-group">
                      <label htmlFor="docente-dni">DNI *</label>
                      <input id="docente-dni" name="dni" value={form.dni} onChange={actualizarCampo} maxLength={20} required />
                    </div>

                    <div className="form-group">
                      <label htmlFor="docente-genero">Género *</label>
                      <select id="docente-genero" name="gender" value={form.gender} onChange={actualizarCampo} required>
                        <option value="">Seleccionar</option>
                        <option value="Femenino">Femenino</option>
                        <option value="Masculino">Masculino</option>
                        <option value="Otro">Otro</option>
                        <option value="Prefiero no decirlo">Prefiero no decirlo</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label htmlFor="docente-fecha">Fecha de nacimiento *</label>
                      <input id="docente-fecha" type="date" name="birthDate" value={form.birthDate} onChange={actualizarCampo} max={new Date().toISOString().split('T')[0]} required />
                    </div>

                    <div className="form-group">
                      <label htmlFor="docente-telefono">Teléfono *</label>
                      <input id="docente-telefono" type="tel" name="phoneNumber" value={form.phoneNumber} onChange={actualizarCampo} maxLength={30} required />
                    </div>

                    <div className="form-group form-group-full">
                      <label htmlFor="docente-direccion">Dirección *</label>
                      <input id="docente-direccion" name="address" value={form.address} onChange={actualizarCampo} maxLength={200} required />
                    </div>
                  </div>
                </div>

                <div className="form-section">
                  <div className="form-section-title">
                    <span>02</span>
                    <div>
                      <h3>Contacto y acceso</h3>
                      <p>Email y especialidad del docente.</p>
                    </div>
                  </div>

                  <div className="form-grid">
                    <div className="form-group form-group-full">
                      <label htmlFor="docente-email">Email *</label>
                      <input id="docente-email" type="email" name="email" value={form.email} onChange={actualizarCampo} maxLength={150} required />
                    </div>

                    <div className="form-group">
                      <label htmlFor="docente-especialidad">Especialidad *</label>
                      <select id="docente-especialidad" name="specialty" value={form.specialty} onChange={actualizarCampo} required>
                        <option value="">Seleccionar especialidad</option>
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
                      <label htmlFor="docente-estado">Estado *</label>
                      <select id="docente-estado" name="estado" value={form.estado} onChange={actualizarCampo} required>
                        <option value="Activo">Activo</option>
                        <option value="Inactivo">Inactivo</option>
                      </select>
                    </div>
                  </div>
                </div>

                {mensaje && <p role="alert" aria-live="polite">{mensaje}</p>}

                <div className="form-actions">
                  <button type="button" className="secondary-button" onClick={cerrarModal}>
                    Cancelar
                  </button>
                  <button type="submit" className="primary-button">
                    {docenteEnEdicion !== null ? 'Guardar cambios' : 'Guardar docente'}
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
