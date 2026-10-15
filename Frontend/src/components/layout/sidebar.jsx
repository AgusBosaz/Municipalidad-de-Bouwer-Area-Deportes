import { NavLink } from 'react-router-dom'
import '../../styles/layout.css'

function Sidebar() {
  return (
    <aside className="sidebar">

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

        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            isActive ? 'active' : ''
          }
        >
          <span className="sidebar-nav-icon">
            ⌂
          </span>

          Inicio
        </NavLink>

        <NavLink
          to="/docentes"
          className={({ isActive }) =>
            isActive ? 'active' : ''
          }
        >
          <span className="sidebar-nav-icon">
            ♙
          </span>

          Docentes
        </NavLink>

        <NavLink
          to="/actividades"
          className={({ isActive }) =>
            isActive ? 'active' : ''
          }
        >
          <span className="sidebar-nav-icon">
            ⚽
          </span>

          Actividades
        </NavLink>

        <NavLink
          to="/asignaciones"
          className={({ isActive }) =>
            isActive ? 'active' : ''
          }
        >
          <span className="sidebar-nav-icon">
            ⇄
          </span>

          Asignaciones
        </NavLink>

      </nav>

      <div className="sidebar-user">

        <div className="sidebar-user-icon">
          👤
        </div>

        <div className="sidebar-user-info">
          <strong>Coordinador</strong>
          <span>Rol Coordinador</span>
        </div>

        <span className="sidebar-user-arrow">
          ›
        </span>

      </div>

    </aside>
  )
}

export default Sidebar