import { useAvisos } from '../components/AvisosContext'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { getInstructors, getInactiveInstructors, reactivateInstructor, CreateInstructor, UpdateInstructor, DeleteInstructor } from '../services/instructor-controller'
import '../styles/docentes.css'

function toDocenteView(docente) {
  return {
    ...docente,
    email: docente.email ?? '',
    nombre: `${docente.firstName} ${docente.lastName}`,
    especialidad: docente.specialty,
    estado: docente.isActive ? 'Activo' : 'Inactivo',
  }
}

function DocentesPage() {
  const { avisar, preguntar } = useAvisos()
  const [modalOpen, setModalOpen] = useState(false)
  const [docenteEnEdicion, setDocenteEnEdicion] = useState(null)
  const [busqueda, setBusqueda] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [credencialNueva, setCredencialNueva] = useState(null)
  const [estadoCopia, setEstadoCopia] = useState('')
  const [guardando, setGuardando] = useState(false)
  const [filtroEstado, setFiltroEstado] = useState('Activo')
  const [reactivandoId, setReactivandoId] = useState(null)

  const [docentes, setDocentes] = useState([])
  const [cargando, setCargando] = useState(true)
  const [errorCarga, setErrorCarga] = useState('')

  useEffect(() => {
    let active = true

    Promise.all([getInstructors(), getInactiveInstructors()])
      .then(([activos, inactivos]) => {
        if (active) setDocentes([...activos, ...inactivos].map(toDocenteView))
      })
      .catch(() => {
        if (active) setErrorCarga('No se pudieron cargar los docentes.')
      })
      .finally(() => {
        if (active) setCargando(false)
      })

    return () => {
      active = false
    }
  }, [])

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

  const cerrarModal = async () => {
    const confirmar = await preguntar(
        '¿Querés cerrar el formulario? Los cambios sin guardar se perderán.'
      )

    if (!confirmar)
      return
    setModalOpen(false)
    setDocenteEnEdicion(null)
    setMensaje('')
  }

  const guardarDocente = async (e) => {
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
      dni,
      gender: form.gender,
      phoneNumber: telefono,
      address: direccion,
      birthDate: form.birthDate,
      email,
      specialty: form.specialty,
    }

    setGuardando(true)
    setMensaje('')

    try {
      if (docenteEnEdicion !== null) {
        await UpdateInstructor(docenteEnEdicion, datosDocente)
        setDocentes((actuales) => actuales.map((docente) =>
          docente.id === docenteEnEdicion
            ? toDocenteView({ ...docente, ...datosDocente })
            : docente
        ))
        await avisar('Docente actualizado correctamente.')
      } else {
        const result = await CreateInstructor(datosDocente)
        setDocentes((actuales) => [
          ...actuales,
          toDocenteView(result.instructor),
        ])
        setCredencialNueva(result)
      }

      setModalOpen(false)
      setDocenteEnEdicion(null)
      setForm({ ...formularioVacio })
    } catch (error) {
      setMensaje(error.status === 409
        ? 'Ya existe un usuario con ese DNI o email.'
        : 'No se pudo guardar el docente. Intentá nuevamente.')
    } finally {
      setGuardando(false)
    }
  }

  const darDeBajaDocente = async (docente) => {
    const confirmar = await preguntar(
      `¿Querés dar de baja a ${docente.nombre}? Se desactivarán sus asignaciones a actividades.`
    )
    if (!confirmar) return

    try {
      await DeleteInstructor(docente.id)
      setDocentes((actuales) =>
        actuales.map((item) => item.id === docente.id
          ? { ...item, isActive: false, estado: 'Inactivo' }
          : item)
      )
      await avisar('El docente fue dado de baja correctamente.')
    } catch {
      await avisar('No se pudo dar de baja al docente. Intentá nuevamente.')
    }
  }

  const reactivarDocente = async (docente) => {
    if (reactivandoId !== null) return
    const confirmar = await preguntar(
      `¿Querés reactivar a ${docente.nombre}? Se generará una nueva contraseña temporal y deberá asignarse nuevamente a sus actividades.`
    )
    if (!confirmar) return
    setReactivandoId(docente.id)
    try {
      const result = await reactivateInstructor(docente.id)
      setDocentes((actuales) => actuales.map((item) =>
        item.id === docente.id ? toDocenteView(result.instructor) : item
      ))
      setCredencialNueva({ ...result, reactivado: true })
    } catch (error) {
      await avisar(error.status === 409
        ? 'No se pudo reactivar al docente. Verificá que siga inactivo y que su rol esté activo.'
        : 'No se pudo confirmar la reactivación. Verificá el estado del docente antes de reintentar; si no recibiste la contraseña, puede recuperarla por correo.')
    } finally {
      setReactivandoId(null)
    }
  }

  const copiarContrasena = async () => {
    try {
      await navigator.clipboard.writeText(credencialNueva.temporaryPassword)
      setEstadoCopia('Contraseña copiada.')
    } catch {
      setEstadoCopia('No se pudo copiar. Seleccionala y copiala manualmente.')
    }
  }

  const docentesFiltrados = docentes.filter((docente) =>
    docente.estado === filtroEstado && `${docente.nombre} ${docente.email} ${docente.especialidad}`
      .toLowerCase()
      .includes(busqueda.toLowerCase())
  )

  return (
    <main className="page docentes-page">
      <div className="page-header">
        <div>
          <h1>Docentes</h1>
          <p>Gestioná los docentes del Área de Deportes y Recreación.</p>
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
            <p>Listado de docentes del Área de Deportes y Recreación.</p>
          </div>
        </div>
        {cargando && <p role="status">Cargando docentes...</p>}
        {errorCarga && <p role="alert">{errorCarga}</p>}

        <div className="docentes-filtros-estado" role="group" aria-label="Estado de docentes">
          <button type="button" aria-pressed={filtroEstado === 'Activo'} onClick={() => setFiltroEstado('Activo')}>Activos</button>
          <button type="button" aria-pressed={filtroEstado === 'Inactivo'} onClick={() => setFiltroEstado('Inactivo')}>Inactivos</button>
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
                      {docente.estado === 'Activo' ? (
                      <>
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
                        onClick={() => darDeBajaDocente(docente)}
                      >
                        Dar de baja
                      </button>
                      </>
                      ) : (
                        <button type="button" className="action-button edit" onClick={() => reactivarDocente(docente)} disabled={reactivandoId !== null}>
                          {reactivandoId === docente.id ? 'Reactivando...' : 'Reactivar'}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {!cargando && !errorCarga && docentesFiltrados.length === 0 && (
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
                      <input id="docente-nombre" placeholder="Ej. Ana" name="firstName" value={form.firstName} onChange={actualizarCampo} maxLength={100} required />
                    </div>

                    <div className="form-group">
                      <label htmlFor="docente-apellido">Apellido *</label>
                      <input id="docente-apellido" placeholder="Ej. Pérez" name="lastName" value={form.lastName} onChange={actualizarCampo} maxLength={100} required />
                    </div>

                    <div className="form-group">
                      <label htmlFor="docente-dni">DNI *</label>
                      <input id="docente-dni" placeholder="Ej. 45123882" name="dni" value={form.dni} onChange={actualizarCampo} maxLength={20} required />
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
                      <input id="docente-telefono" placeholder="Ej. 3511234567" type="tel" name="phoneNumber" value={form.phoneNumber} onChange={actualizarCampo} maxLength={30} required />
                    </div>

                    <div className="form-group form-group-full">
                      <label htmlFor="docente-direccion">Dirección *</label>
                      <input id="docente-direccion" placeholder="Ej. San Martín 123" name="address" value={form.address} onChange={actualizarCampo} maxLength={200} required />
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
                      <input id="docente-email" placeholder="Ej. ana@ejemplo.com" type="email" name="email" value={form.email} onChange={actualizarCampo} maxLength={150} required />
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
                  </div>
                </div>

                {mensaje && <p role="alert" aria-live="polite">{mensaje}</p>}

                <div className="form-actions">
                  <button type="button" className="secondary-button" onClick={cerrarModal}>
                    Cancelar
                  </button>
                  <button type="submit" className="primary-button" disabled={guardando}>
                    {docenteEnEdicion !== null ? 'Guardar cambios' : 'Guardar docente'}
                  </button>
                </div>
              </form>
            </div>
          </section>
        </div>,
        document.body
      )}
      {credencialNueva && createPortal(
        <div className="docente-modal-overlay">
          <section
            className="docente-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="temp-password-title"
          >
            <div className="docente-modal-content">
              <h2 id="temp-password-title">{credencialNueva.reactivado ? 'Docente reactivado' : 'Docente creado'}</h2>
              <p>
                Guardá esta contraseña temporal y entregásela al docente.
                No se volverá a mostrar.
              </p>
              {credencialNueva.reactivado && <p>Deberá cambiarla al ingresar. Sus actividades deben asignarse nuevamente.</p>}

              <div className="form-group">
                <label htmlFor="temp-password">Contraseña temporal</label>
                <input
                  id="temp-password"
                  type="text"
                  readOnly
                  value={credencialNueva.temporaryPassword}
                  onFocus={(event) => event.target.select()}
                />
                <button type="button" className="docente-copiar" onClick={copiarContrasena}>
                  Copiar contraseña
                </button>
                <span className="docente-copia-estado" role="status">{estadoCopia}</span>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="primary-button"
                  onClick={() => { setCredencialNueva(null); setEstadoCopia('') }}
                >
                  Ya la guardé
                </button>
              </div>
            </div>
          </section>
        </div>,
        document.body
      )}
    </main>
  )
}

export default DocentesPage
