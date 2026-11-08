import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAvisos } from '../components/AvisosContext'
import { getSession } from '../services/AuthSession'
import { deactivateCoordinator, getCoordinators } from '../services/coordinatorService'
import '../styles/docentes.css'
import '../styles/coordinadores.css'

export default function CoordinadoresPage() {
  const { preguntar, avisar } = useAvisos()
  const [coordinadores, setCoordinadores] = useState([])
  const [busqueda, setBusqueda] = useState('')
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [desactivando, setDesactivando] = useState(null)
  const currentUserId = getSession()?.userId

  useEffect(() => {
    let active = true
    getCoordinators()
      .then((data) => { if (active) setCoordinadores(data) })
      .catch(() => { if (active) setError('No se pudieron cargar los coordinadores.') })
      .finally(() => { if (active) setCargando(false) })
    return () => { active = false }
  }, [])

  async function darDeBaja(coordinador) {
    if (desactivando !== null) return
    const nombre = `${coordinador.firstName} ${coordinador.lastName}`
    if (!await preguntar(`¿Querés dar de baja a ${nombre}? Ya no podrá ingresar al sistema.`)) return
    setDesactivando(coordinador.id)
    try {
      await deactivateCoordinator(coordinador.id)
      setCoordinadores((actuales) => actuales.filter((item) => item.id !== coordinador.id))
      await avisar('El coordinador fue dado de baja correctamente.')
    } catch (errorApi) {
      let mensaje = ''
      try { mensaje = JSON.parse(errorApi.message).message || '' } catch { /* Error de conexión. */ }
      await avisar(mensaje || 'No se pudo dar de baja al coordinador. Intentá nuevamente.')
    } finally {
      setDesactivando(null)
    }
  }

  const filtro = busqueda.trim().toLocaleLowerCase('es')
  const visibles = coordinadores.filter((coordinador) =>
    `${coordinador.firstName} ${coordinador.lastName} ${coordinador.dni} ${coordinador.email || ''}`
      .toLocaleLowerCase('es').includes(filtro))

  return (
    <main className="page coordinadores-page">
      <div className="page-header">
        <div>
          <h1>Coordinadores</h1>
          <p>Gestioná los coordinadores del Área de Deportes y Recreación.</p>
        </div>
        <div className="page-header-actions">
          <input className="search-input" type="search" aria-label="Buscar coordinador"
            placeholder="Buscar coordinador..." value={busqueda}
            onChange={(event) => setBusqueda(event.target.value)} />
          <Link className="primary-button" to="/coordinadores/nuevo">+ Nuevo</Link>
        </div>
      </div>
      <section className="content-card">
        <div className="content-card-header">
          <div><h2>Coordinadores registrados</h2><p>Listado de coordinadores activos.</p></div>
        </div>
        {cargando && <p role="status">Cargando coordinadores...</p>}
        {error && <p role="alert">{error}</p>}
        {!cargando && !error && (
          <div className="table-container coordinadores-table">
            <table>
              <thead><tr><th>Nombre</th><th>DNI</th><th>Email</th><th>Estado</th><th>Acciones</th></tr></thead>
              <tbody>
                {visibles.map((coordinador) => (
                  <tr key={coordinador.id}>
                    <td data-label="Nombre">{coordinador.firstName} {coordinador.lastName}</td>
                    <td data-label="DNI">{coordinador.dni}</td>
                    <td data-label="Email">{coordinador.email || 'Sin correo'}</td>
                    <td data-label="Estado"><span className="status-badge status-active">Activo</span></td>
                    <td data-label="Acciones">
                      {coordinador.id === currentUserId ? (
                        <span>Tu cuenta</span>
                      ) : (
                        <button type="button" className="action-button delete"
                          disabled={desactivando !== null} onClick={() => darDeBaja(coordinador)}>
                          {desactivando === coordinador.id ? 'Dando de baja...' : 'Dar de baja'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {visibles.length === 0 && (
                  <tr><td colSpan="5" className="docentes-empty">No se encontraron coordinadores.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  )
}
