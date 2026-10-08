import { useLocation } from 'react-router-dom'
import '../../styles/layout.css'

function Header() {
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
      default:
        return 'Dashboard'
    }
  }

  return (
    <header className="header">
      <div>
        <h1>{getTitle()}</h1>
        <p>Área de Deportes</p>
      </div>

      <div className="header-right">
        <div className="header-notification">
          ♢
        </div>

        <div className="header-user">
          <div className="header-avatar">
            A
          </div>

          <div>
            <strong>Administrador</strong>
            <span>Coordinador</span>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header