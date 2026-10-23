import { Routes, Route, Navigate } from 'react-router-dom'

import { useEffect, useState } from 'react'
import { getCurrentUser } from './services/Auth.js'
import { clearSession, getSession } from './services/AuthSession'

import Layout from './components/layout/Layout'
import Login from './pages/Login.jsx'
import RecoverPassword from './pages/RecoverPassword'
import ResetPassword from './pages/ResetPassword'
import DashboardPage from './pages/DashboardPage'
import DocentesPage from './pages/DocentesPage'
import ActividadesPage from './pages/Actividadespage'
import AsignacionesPage from './pages/AsignacionesPage'
import InscripcionAlumnos from './pages/InscripcionAlumnos'
import AsistenciaPage from './pages/AsistenciaPage'

import './styles/App.css'

function ProtectedLayout() {
  const [status, setStatus] = useState(
    () => getSession() ? 'checking' : 'unauthenticated'
  )

  useEffect(() => {
    if (status !== 'checking') return

    let active = true

    getCurrentUser()
      .then(() => {
        if (active) setStatus('verified')
      })
      .catch((error) => {
        if (!active) return

        if (error.status === 401 || error.status === 403) {
          clearSession()
          setStatus('unauthenticated')
        } else {
          setStatus('error')
        }
      })

    return () => {
      active = false
    }
  }, [status])

  if (status === 'checking') {
    return <p role="status">Validando sesión...</p>
  }

  if (status === 'error') {
    return (
      <div role="alert">
        <p>No se pudo verificar la sesión.</p>
        <button type="button" onClick={() => setStatus('checking')}>
          Reintentar
        </button>
      </div>
    )
  }

  if (status !== 'verified') {
    return <Navigate to="/login" replace />
  }

  const session = getSession()
  return session
    ? <Layout session={session} />
    : <Navigate to="/login" replace />
}

function CoordinatorOnly({ children }) {
  return getSession()?.role === 'Coordinator'
    ? children
    : <Navigate to="/asistencia" replace />
}

function HomePage() {
  return getSession()?.role === 'Instructor'
    ? <Navigate to="/asistencia" replace />
    : <DashboardPage />
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/recuperar-contrasena" element={<RecoverPassword />} />
      <Route path="/restablecer-contrasena" element={<ResetPassword />} />

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
