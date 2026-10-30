import { useLocation } from 'react-router-dom'
import '../../styles/layout.css'

function Header({ isMenuOpen, onMenuClick, session }) {
  const location = useLocation()

  const getTitle = () => {
    switch (location.pathname) {
      case '/':
        return 'Dashboard'
      case '/docentes':
        return 'Docentes'
      case '/docentes/nuevo':
        return 'Nuevo docente'
      case '/actividades':
        return 'Actividades'
      case '/actividades/nueva':
        return 'Nueva actividad'
      case '/asignaciones':
        return 'Asignaciones'
      case '/inscribir-alumnos':
        return 'Inscripciones'
      case '/asistencia':
        return 'Asistencia'
      case '/mis-actividades':
        return 'Mis actividades'
      default:
        return location.pathname.startsWith('/asistencia/') ||
          location.pathname.startsWith('/mis-actividades/')
          ? 'Asistencia'
          : 'Dashboard'
    }
  }

  return (
    <header className="header">
      <button
        type="button"
        className="menu-button"
        aria-label={isMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
        aria-expanded={isMenuOpen}
        aria-controls="primary-navigation"
        onClick={onMenuClick}
      >
        ☰
      </button>
      <div>
        <h1>{getTitle()}</h1>
        <p>Área de Deportes y Recreación</p>
      </div>

      <div className="header-right">
        <div className="header-notification">
          ♢
        </div>

        <div className="header-user">
          <div className="header-avatar">
            {session.name.charAt(0)}
          </div>

          <div>
            <strong>{session.name}</strong>
            <span>{session.role === 'Coordinator' ? 'Coordinador' : 'Docente'}</span>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
