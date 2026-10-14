import { useState } from 'react'
import MunicipalBrand from '../components/MunicipalBrand'

export default function RecoverPassword() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')

  function handleEmailChange(event) {
    setEmail(event.target.value)
    setMessage('')
  }

  function handleSubmit(event) {
    event.preventDefault()
    setMessage(
      'Enlace enviado correctamente.',
    )
  }

  function handleBackToLogin() {
  }

  return (
    <main className="recovery-page">
      <div className="decoration decoration-top" aria-hidden="true" />
      <div className="decoration decoration-bottom" aria-hidden="true" />
      <div className="recovery-layout">
        <MunicipalBrand />
        <section className="recovery-card" aria-labelledby="recovery-title">
          <h1 id="recovery-title">Recuperar contraseña</h1>
          <p className="recovery-description">
            Ingresá tu correo electrónico para recibir un enlace y poder
            restablecer tu contraseña.
          </p>
          <form onSubmit={handleSubmit}>
            <label htmlFor="email">Correo electrónico</label>
            <div className="email-field">
              <svg
                viewBox="0 0 28 28"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <rect x="2" y="4" width="24" height="20" rx="2" />
                <path d="m3 6 11 9L25 6" />
              </svg>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="tu@correo.com"
                required
                value={email}
                onChange={handleEmailChange}
              />
            </div>
            <button className="send-button" type="submit">
              Enviar enlace
            </button>
          </form>
          {message && (
            <p className="form-message" role="status">
              {message}
            </p>
          )}
          <button
            className="back-button"
            type="button"
            onClick={handleBackToLogin}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              aria-hidden="true"
            >
              <path d="M21 12H3m7-7-7 7 7 7" />
            </svg>
            Volver a iniciar sesión
          </button>
        </section>
      </div>
    </main>
  )
}
