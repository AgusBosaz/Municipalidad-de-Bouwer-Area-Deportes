import { Routes, Route, Navigate } from 'react-router-dom'

import { useEffect, useState } from 'react'
import { getCurrentUser } from './services/Auth.js'
import {
  clearSession,
  expireSession,
  getSession,
  saveSession,
  SESSION_EXPIRED_EVENT,
} from './services/AuthSession'

import Layout from './components/layout/Layout.jsx'
import Login from './pages/Login.jsx'
import ChangeInitialPassword from './pages/ChangeInitialPassword.jsx'
import RecoverPassword from './pages/RecoverPassword.jsx'
import ResetPassword from './pages/ResetPassword.jsx'
import DashboardPage from './pages/DashboardPage.jsx'
import DocentesPage from './pages/DocentesPage.jsx'
import ActividadesPage from './pages/Actividadespage.jsx'
import AsignacionesPage from './pages/AsignacionesPage.jsx'
import InscripcionAlumnos from './pages/InscripcionAlumnos.jsx'
import AsistenciaPage from './pages/AsistenciaPage.jsx'
import ActividadesInicio from './pages/ActividadesInicio.jsx'
import DocenteInicioPage from './pages/DashboardTeacherPage.jsx'
import MisActividadesPage from './pages/MyActivities-Teacher.jsx'
import AsistenciaDocentePage from './pages/AsistenciaDocentePage.jsx'
import AttendanceHistoryPage from './pages/AttendanceHistory.jsx'

import './styles/App.css'

function ProtectedLayout() {
  const [status, setStatus] = useState(() => {
    const session = getSession()
    return session?.mustChangePassword
      ? 'password-change'
      : session ? 'checking' : 'unauthenticated'
  })

  useEffect(() => {
    const handleSessionExpired = () => setStatus('unauthenticated')
    window.addEventListener(SESSION_EXPIRED_EVENT, handleSessionExpired)
    return () => window.removeEventListener(SESSION_EXPIRED_EVENT, handleSessionExpired)
  }, [])

  useEffect(() => {

    if (status !== 'checking') return

    let active = true

    getCurrentUser()
      .then((currentUser) => {
        if (!active) return

        const session = getSession()
        if (!session) {
          setStatus('unauthenticated')
          return
        }

        saveSession({
          ...session,
          userId: currentUser.userId,
          fullName: currentUser.fullName,
          dni: currentUser.dni,
          roles: currentUser.roles,
          permissions: currentUser.permissions,
        })

        if (!getSession()) {
          clearSession()
          setStatus('unauthenticated')
          return
        }

        setStatus('verified')
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

  useEffect(() => {
    if (status !== 'verified') return

    const session = getSession()
    if (!session) {
      expireSession()
      return
    }

    const timeout = window.setTimeout(
      expireSession,
      Math.max(0, Date.parse(session.expiresAt) - Date.now())
    )
    const checkOnReturn = () => {
      if (document.visibilityState === 'visible' && !getSession()) {
        expireSession()
      }
    }
    document.addEventListener('visibilitychange', checkOnReturn)

    return () => {
      window.clearTimeout(timeout)
      document.removeEventListener('visibilitychange', checkOnReturn)
    }
  }, [status])

  if (status === 'password-change') {
    return <Navigate to="/cambiar-contrasena-inicial" replace />
  }

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

function InstructorOnly({ children }) {
  return getSession()?.role === 'Instructor'
    ? children
    : <Navigate to="/inicio" replace />
}

function HomePage() {
  return getSession()?.role === 'Instructor'
    ? <Navigate to="/docente" replace />
    : <DashboardPage />
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<ActividadesInicio />} />
      <Route path="/login" element={<Login />} />

      <Route
        path="/cambiar-contrasena-inicial" element={<ChangeInitialPassword />} />

      <Route path="/recuperar-contrasena" element={<RecoverPassword />} />

      <Route path="/restablecer-contrasena" element={<ResetPassword />} />

      <Route element={<ProtectedLayout />}>
        <Route path="/inicio" element={<HomePage />} />
        <Route
          path="/asistencia"
          element={getSession()?.role === 'Instructor'
            ? <Navigate to="/mis-actividades" replace />
            : <AsistenciaPage />}
        />
        <Route path="/asistencia/:actividadId" element={<AsistenciaDocentePage />} />

        <Route
          path="/docentes"
          element={<CoordinatorOnly><DocentesPage /></CoordinatorOnly>}
        />

        <Route
          path="/docente"
          element={<InstructorOnly><DocenteInicioPage session={getSession()} /></InstructorOnly>}
        />
        <Route
          path="/mis-actividades"
          element={<InstructorOnly><MisActividadesPage /></InstructorOnly>}
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
        <Route
          path="/attendance-history"
          element={<AttendanceHistoryPage />}
        />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
