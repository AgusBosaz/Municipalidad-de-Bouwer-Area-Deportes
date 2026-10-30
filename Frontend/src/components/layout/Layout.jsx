import { useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { clearSession } from '../../services/AuthSession'

import Sidebar from './sidebar'
import Header from './Header'

import '../../styles/layout.css'

function Layout({ session }) {
  const [menuOpen, setMenuOpen] = useState(false)

  const navigate = useNavigate()

  function handleLogout() {
    clearSession()
    setMenuOpen(false)
    navigate('/login', { replace: true })
  }

  return (
    <div className="app-layout">

      <Sidebar
        onLogout={handleLogout}
        session={session}
        isOpen={menuOpen}
        onNavigate={() => setMenuOpen(false)}
      />

      {menuOpen && (
        <button
          type="button"
          className="sidebar-overlay"
          aria-label="Cerrar menú"
          onClick={() => setMenuOpen(false)}
        />
      )}

      <div className="app-main">

        <Header
          session={session}
          isMenuOpen={menuOpen}
          onMenuClick={() => setMenuOpen((open) => !open)}
        />

        <main className="main-content">
          <Outlet />
        </main>

      </div>

    </div>
  )
}

export default Layout