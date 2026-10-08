import { Routes, Route, Navigate } from 'react-router-dom'

import Layout from './components/layout/Layout'

import DashboardPage from './pages/DashboardPage'
import DocentesPage from './pages/DocentesPage'
import ActividadesPage from './pages/ActividadesPage'
import AsignacionesPage from './pages/AsignacionesPage'

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/docentes" element={<DocentesPage />} />
        <Route path="/actividades" element={<ActividadesPage />} />
        <Route path="/asignaciones" element={<AsignacionesPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App