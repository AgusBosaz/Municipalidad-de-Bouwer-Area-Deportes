import { useState } from "react";
import "../styles/Login.css";

import { useNavigate } from 'react-router-dom'
import { loginDemo } from '../demoAuth'

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
      <section className="login-izquierda">
        <div className="logo-contenedor">
          <div className="logo">
            <svg
              className="logo-simbolo"
              viewBox="0 0 200 200"
              xmlns="http://www.w3.org/2000/svg"
              role="img"
              aria-label="Logo de Bouwer"
            >
              <defs>
                <clipPath id="circulo-bouwer">
                  <circle cx="100" cy="100" r="92" />
                </clipPath>
              </defs>

              {/* Fondo circular */}
              <circle
                cx="100"
                cy="100"
                r="94"
                fill="#981744"
              />

              <g clipPath="url(#circulo-bouwer)">
                {/* Sol blanco */}
                <circle
                  cx="82"
                  cy="79"
                  r="49"
                  fill="white"
                />

                {/* Detalles del cielo */}
                <g fill="#981744" opacity="0.5">
                  <ellipse
                    cx="76"
                    cy="48"
                    rx="4"
                    ry="2"
                  />
                  <ellipse
                    cx="92"
                    cy="40"
                    rx="3"
                    ry="2"
                  />
                  <circle cx="102" cy="52" r="2.5" />
                  <circle cx="88" cy="62" r="2" />
                </g>

                {/* Dos edificios de la izquierda */}
                <g fill="#981744">
                  <path d="M40 116 V70 L51 57 L62 70 V116 Z" />
                  <path d="M62 116 V82 L72 72 L82 82 V116 Z" />
                </g>

                {/* Árbol del centro */}
                <g
                  fill="none"
                  stroke="#981744"
                  strokeWidth="9"
                  strokeLinecap="round"
                >
                  <path d="M103 119 V79" />
                </g>

                {/* Construcciones de la derecha */}
                <g
                  fill="white"
                  stroke="#981744"
                  strokeWidth="3"
                >
                  <path d="M140 118 V96 H153 V118 Z" />
                  <path d="M153 118 V87 L164 79 L175 87 V118 Z" />
                  <path d="M175 118 V99 H186 V118 Z" />
                </g>

                {/* Techos y detalles */}
                <g
                  fill="none"
                  stroke="#981744"
                  strokeWidth="2.5"
                >
                  <path d="M137 96 L146 88 L156 96" />
                  <path d="M151 87 L164 76 L177 87" />
                  <path d="M160 79 V70" />
                  <path d="M156 74 H164" />
                  <path d="M160 99 V117" />
                  <path d="M170 99 V117" />
                  <path d="M144 104 H150" />
                </g>

                {/* Campo blanco */}
                <path
                  d="M0 125
                     Q48 103 96 119
                     Q137 105 200 112
                     V205 H0 Z"
                  fill="white"
                />

                {/*líneas curvas */}
                <g
                  stroke="#981744"
                  strokeWidth="10"
                  strokeLinecap="round"
                  fill="none"
                >
                  <path d="M32 200 Q65 128 195 111" />
                  <path d="M60 205 Q91 139 198 121" />
                  <path d="M90 207 Q119 150 201 133" />
                  <path d="M120 208 Q147 164 204 146" />
                  <path d="M150 208 Q175 179 207 160" />
                </g>

              </g>
            </svg>

            <div className="logo-separador"></div>

            <div className="logo-texto">
              <span className="municipalidad">
                Municipalidad de
              </span>
              <h1>BOUWER</h1>
            </div>
          </div>

          <h2 className="logo-subtitulo">
            Área de Deportes y Recreación
          </h2>
        </div>

        <p className="descripcion">
          Gestión de actividades, docentes
          <br />
          y asistencia de alumnos
        </p>
      </section>

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
          ¿Olvidaste tu contraseña?
        </p>
      </section>
    </main>
  );
}

export default Login;
