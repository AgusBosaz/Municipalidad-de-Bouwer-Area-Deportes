import { NavLink } from 'react-router-dom'
import '../../styles/layout.css'

function Sidebar({ isOpen, onNavigate, session, onLogout }) {
  const links = session.role === 'Coordinator'
    ? [
      { to: '/', label: 'Inicio', icon: '⌂' },
      { to: '/docentes', label: 'Docentes', icon: '♙' },
      { to: '/actividades', label: 'Actividades', icon: '⚽' },
      { to: '/asignaciones', label: 'Asignaciones', icon: '⇄' },
      { to: '/inscribir-alumnos', label: 'Inscripciones', icon: '📋' },
      { to: '/asistencia', label: 'Asistencia', icon: '✓' },
    ]
    : [
      { to: '/asistencia', label: 'Asistencia', icon: '✓' },
    ]
  return (
    <aside
      id="primary-navigation"
      className={`sidebar ${isOpen ? 'sidebar-open' : ''}`}
    >

      <div className="sidebar-brand">
        <div className="sidebar-brand-icon">
          AD
        </div>

        <div>
          <strong>Área de Deportes</strong>
          <span>Municipalidad de Bouwer</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {links.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            onClick={onNavigate}
            className={({ isActive }) => isActive ? 'active' : ''}
          >
            <span className="sidebar-nav-icon">{icon}</span>
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-user">

        <div className="sidebar-user-icon">
          {session.name.charAt(0)}
        </div>

        <div className="sidebar-user-info">
          <strong>{session.name}</strong>
          <span>
            Rol {session.role === 'Coordinator' ? 'Coordinador' : 'Docente'}
          </span>
        </div>

        <button type="button" className="sidebar-logout" onClick={onLogout}>
          Salir
        </button>

      </div>

    </aside>
  )
}

export default Sidebar