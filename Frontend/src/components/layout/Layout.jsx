import { Outlet } from 'react-router-dom'

import Sidebar from './Sidebar'
import Header from './Header'

import '../../styles/layout.css'

function Layout() {
  return (
    <div className="app-layout">

      <Sidebar />

      <div className="app-main">

        <Header title="Inicio" />

        <main className="main-content">
          <Outlet />
        </main>

      </div>

    </div>
  )
}

export default Layout