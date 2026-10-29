import { NavLink } from 'react-router-dom'
import {
  CalendarDays,
  CircleCheck,
  ClipboardList,
  GraduationCap,
  LayoutDashboard,
  Trophy,
  UsersRound,
} from 'lucide-react'
import '../../styles/layout.css'

function Sidebar({ isOpen, onNavigate, session, onLogout }) {
  const links = session.role === 'Coordinator'
    ? [
        { to: '/', label: 'Inicio', Icon: LayoutDashboard },
        { to: '/docentes', label: 'Docentes', Icon: UsersRound },
        { to: '/actividades', label: 'Actividades', Icon: Trophy },
        { to: '/asignaciones', label: 'Asignaciones', Icon: CalendarDays },
        { to: '/inscribir-alumnos', label: 'Inscripciones', Icon: ClipboardList },
        { to: '/alumnos', label: 'Alumnos', Icon: GraduationCap },
        { to: '/asistencia', label: 'Asistencia', Icon: CircleCheck },
      ]
    : [
        { to: '/asistencia', label: 'Asistencia', Icon: CircleCheck },
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
        {links.map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/' || to === '/docente'}
            onClick={onNavigate}
            className={({ isActive }) => isActive ? 'active' : ''}
          >
            <span className="sidebar-nav-icon" aria-hidden="true">
              <Icon size={19} strokeWidth={1.8} />
            </span>
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