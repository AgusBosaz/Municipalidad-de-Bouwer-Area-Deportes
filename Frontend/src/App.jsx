import { Routes, Route, Navigate } from 'react-router-dom'

import { getDemoSession } from './demoAuth'
import Layout from './components/layout/Layout'
import Login from './pages/Login.jsx'
import DashboardPage from './pages/DashboardPage'
import DocentesPage from './pages/DocentesPage'
import ActividadesPage from './pages/Actividadespage'
import AsignacionesPage from './pages/AsignacionesPage'
import InscripcionAlumnos from './pages/InscripcionAlumnos'
import AsistenciaPage from './pages/AsistenciaPage'

import './styles/App.css'

function ProtectedLayout() {
  const session = getDemoSession()

  return session
    ? <Layout session={session} />
    : <Navigate to="/login" replace />
}

function CoordinatorOnly({ children }) {
  return getDemoSession()?.role === 'Coordinator'
    ? children
    : <Navigate to="/asistencia" replace />
}

function HomePage() {
  return getDemoSession()?.role === 'Instructor'
    ? <Navigate to="/asistencia" replace />
    : <DashboardPage />
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route element={<ProtectedLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/asistencia" element={<AsistenciaPage />} />

        <Route
          path="/docentes"
          element={<CoordinatorOnly><DocentesPage /></CoordinatorOnly>}
        />
        <Route
          path="/actividades"
          element={<CoordinatorOnly><ActividadesPage /></CoordinatorOnly>}
        />
        <Route
          path="/asignaciones"
          element={<CoordinatorOnly><AsignacionesPage /></CoordinatorOnly>}
        />
        <Route
          path="/inscribir-alumnos"
          element={<CoordinatorOnly><InscripcionAlumnos /></CoordinatorOnly>}
        />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App