import { Routes, Route, Navigate } from 'react-router-dom'

import Layout from './components/layout/Layout'

import Login from './pages/Login.jsx'
import DashboardPage from './pages/DashboardPage'
import DocentesPage from './pages/DocentesPage'
import ActividadesPage from './pages/ActividadesPage'
import AsignacionesPage from './pages/AsignacionesPage'
import InscripcionAlumnos from "./pages/InscripcionAlumnos";

import './styles/App.css'

function App() {
  return (
    <Routes>
      {/* Tu pantalla de inicio de sesión */}
      <Route path="/login" element={<Login />} />

      {/* Páginas de tus compañeros */}
      <Route element={<Layout />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/docentes" element={<DocentesPage />} />
        <Route path="/actividades" element={<ActividadesPage />} />
        <Route path="/asignaciones" element={<AsignacionesPage />} />
        <Route path="/inscribir-alumnos" element={<InscripcionAlumnos />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App