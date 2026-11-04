import { useState } from "react";
import "../styles/Login.css";

import { Link, useNavigate } from 'react-router-dom'
import { login as loginWithApi } from '../services/Auth'
import { saveSession } from "../services/AuthSession";
import MunicipalBrand from '../components/MunicipalBrand'

function Login() {
  const [usuario, setUsuario] = useState("");
  const [contrasena, setContrasena] = useState("");

  const navigate = useNavigate()

  async function ingresar(e) {
    e.preventDefault()

    if (!usuario.trim() || !contrasena.trim()) {
      alert('Completá DNI y contraseña')
      return
    }

    try {
      const response = await loginWithApi(usuario.trim(), contrasena)
      saveSession(response)

      if (response.mustChangePassword) {
        navigate('/cambiar-contrasena-inicial', { replace: true })
        return
      }

      navigate('/inicio', { replace: true })
    } catch (error) {
      if (error.status === 401) {
        alert('DNI o contraseña incorrectos.')
      } else if (error.status === 403) {
        alert('El usuario está inactivo.')
      } else if (error.status === 429) {
        alert('Demasiados intentos. Esperá unos minutos antes de volver a ingresar.')
      } else {
        alert('No se pudo iniciar sesión. Revisá que la API este funcionando.')
      }
    }
  }

  return (
    <main className="login">
      <MunicipalBrand />

      <section className="login-derecha">
        <h2>Iniciar sesión</h2>

        <form onSubmit={ingresar}>
          <input
            type="text"
            placeholder="DNI"
            value={usuario}
            onChange={(e) => setUsuario(e.target.value)}
          />

          <input
            type="password"
            placeholder="Contraseña"
            value={contrasena}
            onChange={(e) => setContrasena(e.target.value)}
          />

          <button type="submit">
            Ingresar
          </button>
        </form>

        <p className="olvidaste">
          <Link to="/recuperar-contrasena">¿Olvidaste tu contraseña?</Link>
        </p>
      </section>
    </main>
  );
}

export default Login;
