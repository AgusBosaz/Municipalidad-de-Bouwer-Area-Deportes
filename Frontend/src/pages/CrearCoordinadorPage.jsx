import { useState } from 'react'
import { Link } from 'react-router-dom'
import { createCoordinator } from '../services/coordinatorService'
import '../styles/coordinadores.css'

const formularioVacio = {
  firstName: '', lastName: '', dni: '', email: '', gender: '',
  phoneNumber: '', address: '', birthDate: '',
}

export default function CrearCoordinadorPage() {
  const [form, setForm] = useState(formularioVacio)
  const [error, setError] = useState('')
  const [guardando, setGuardando] = useState(false)
  const [credencial, setCredencial] = useState(null)
  const [estadoCopia, setEstadoCopia] = useState('')

  async function copiarContrasena() {
    try {
      await navigator.clipboard.writeText(credencial.temporaryPassword)
      setEstadoCopia('Contraseña copiada.')
    } catch {
      setEstadoCopia('No se pudo copiar. Seleccionala y copiala manualmente.')
    }
  }

  function cambiar(event) {
    const { name, value } = event.target
    setForm((actual) => ({ ...actual, [name]: value }))
  }

  async function crear(event) {
    event.preventDefault()
    if (guardando) return
    const datos = Object.fromEntries(Object.entries(form).map(([key, value]) => [key, value.trim()]))
    if (Object.values(datos).some((value) => !value)) {
      setError('Completá todos los campos.')
      return
    }
    if (!/^[0-9]{7,20}$/.test(datos.dni)) {
      setError('Ingresá un DNI de 7 a 20 dígitos, sin puntos.')
      return
    }
    const hoy = new Date()
    const fechaHoy = new Date(hoy.getTime() - hoy.getTimezoneOffset() * 60000).toISOString().slice(0, 10)
    if (datos.birthDate > fechaHoy) {
      setError('La fecha de nacimiento no puede ser futura.')
      return
    }
    setGuardando(true)
    setError('')
    try {
      const result = await createCoordinator(datos)
      setForm(formularioVacio)
      setCredencial(result)
    } catch (errorApi) {
      let mensaje = ''
      try { mensaje = JSON.parse(errorApi.message).message || '' } catch { /* Error de red o validación. */ }
      setError(mensaje || (errorApi.status === 400
        ? 'Revisá que los datos ingresados sean válidos.'
        : 'No se pudo confirmar la creación. Antes de reintentar, verificá si el usuario fue creado. Si no recibiste la contraseña temporal, puede recuperarla por correo.'))
    } finally {
      setGuardando(false)
    }
  }

  return (
    <main className="page coordinador-page">
      <div className="page-header">
        <div>
          <h1>Crear coordinador</h1>
          <p>Registrá a una persona que administrará el Área de Deportes y Recreación.</p>
        </div>
      </div>
      {credencial ? (
        <section className="content-card coordinador-credencial" aria-live="polite">
          <h2>Coordinador creado</h2>
          <p>Entregale a {credencial.fullName} su DNI y esta contraseña temporal. Al ingresar deberá elegir una nueva.</p>
          <p className="coordinador-credencial-aviso">La contraseña se muestra una sola vez. Guardala antes de salir de esta pantalla.</p>
          <label htmlFor="coordinador-temporal">Contraseña temporal</label>
          <input id="coordinador-temporal" value={credencial.temporaryPassword} readOnly />
          <button type="button" className="coordinador-copiar" onClick={copiarContrasena}>Copiar contraseña</button>
          <p role="status">{estadoCopia}</p>
          <div className="coordinador-acciones">
            <Link className="primary-button" to="/coordinadores">Ya guardé la contraseña</Link>
          </div>
        </section>
      ) : (
        <section className="content-card">
          <div className="content-card-header"><div><h2>Datos del coordinador</h2><p>Todos los campos son obligatorios.</p></div></div>
          <form onSubmit={crear}>
            <div className="form-grid">
              <div className="form-group"><label htmlFor="coord-nombre">Nombre *</label><input id="coord-nombre" placeholder="Ej. Ana" name="firstName" maxLength={100} value={form.firstName} onChange={cambiar} required /></div>
              <div className="form-group"><label htmlFor="coord-apellido">Apellido *</label><input id="coord-apellido" placeholder="Ej. Pérez" name="lastName" maxLength={100} value={form.lastName} onChange={cambiar} required /></div>
              <div className="form-group"><label htmlFor="coord-dni">DNI *</label><input id="coord-dni" placeholder="Ej. 45123882" name="dni" inputMode="numeric" maxLength={20} value={form.dni} onChange={cambiar} required /></div>
              <div className="form-group"><label htmlFor="coord-email">Correo electrónico *</label><input id="coord-email" placeholder="Ej. ana@ejemplo.com" name="email" type="email" maxLength={254} value={form.email} onChange={cambiar} required /></div>
              <div className="form-group"><label htmlFor="coord-genero">Género *</label><select id="coord-genero" name="gender" value={form.gender} onChange={cambiar} required><option value="">Seleccionar género</option><option value="Femenino">Femenino</option><option value="Masculino">Masculino</option><option value="Otro">Otro</option></select></div>
              <div className="form-group"><label htmlFor="coord-nacimiento">Fecha de nacimiento *</label><input id="coord-nacimiento" name="birthDate" type="date" value={form.birthDate} onChange={cambiar} required /></div>
              <div className="form-group"><label htmlFor="coord-telefono">Teléfono *</label><input id="coord-telefono" placeholder="Ej. 3511234567" name="phoneNumber" type="tel" maxLength={30} value={form.phoneNumber} onChange={cambiar} required /></div>
              <div className="form-group"><label htmlFor="coord-direccion">Dirección *</label><input id="coord-direccion" placeholder="Ej. San Martín 123" name="address" maxLength={200} value={form.address} onChange={cambiar} required /></div>
            </div>
            {error && <p className="coordinador-error" role="alert">{error}</p>}
            <div className="coordinador-acciones">
              <Link className="secondary-button coordinador-volver" to="/coordinadores">Cancelar</Link>
              <button type="submit" className="primary-button" disabled={guardando}>{guardando ? 'Creando...' : 'Crear coordinador'}</button>
            </div>
          </form>
        </section>
      )}
    </main>
  )
}
