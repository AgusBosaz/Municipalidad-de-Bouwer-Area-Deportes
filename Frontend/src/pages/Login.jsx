import { useState } from "react";
import "../styles/Login.css";

import { Link, useNavigate } from 'react-router-dom'
import { loginDemo } from '../demoAuth'
import MunicipalBrand from '../components/MunicipalBrand'

function Login() {
  const [usuario, setUsuario] = useState("");
  const [contrasena, setContrasena] = useState("");

  const navigate = useNavigate()

  function ingresar(e) {
    e.preventDefault()

    if (!usuario.trim() || !contrasena.trim()) {
      alert('Completá todos los campos')
      return
    }

    const session = loginDemo(usuario, contrasena)

    if (!session) {
      alert('Usuario o contraseña incorrectos')
      return
    }

    navigate('/', { replace: true })
  }

  return (
    <main className="login">
      <MunicipalBrand />

      <section className="login-derecha">
        <h2>Iniciar sesión</h2>

        <form onSubmit={ingresar}>
          <input
            type="text"
            placeholder="Usuario"
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
