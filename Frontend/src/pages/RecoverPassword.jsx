import { useState } from 'react'
import { Link } from 'react-router-dom'
import MunicipalBrand from '../components/MunicipalBrand'
import '../styles/Login.css'
import '../styles/recovery.css'

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
      'El envío de enlaces todavía no está disponible. Consultá con el coordinador para recuperar el acceso.',
    )
  }

  return (
    <main className="login recovery-page">
      <MunicipalBrand />
      <section className="login-derecha recovery-card" aria-labelledby="recovery-title">
        <h2 id="recovery-title">Recuperar contraseña</h2>
        <p className="recovery-description">
          Ingresá tu correo electrónico para solicitar la recuperación de tu
          contraseña.
        </p>
        <form onSubmit={handleSubmit}>
          <label className="recovery-label" htmlFor="email">Correo electrónico</label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="Correo electrónico"
            required
            value={email}
            onChange={handleEmailChange}
          />
          <button type="submit">Solicitar enlace</button>
        </form>
        {message && (
          <p className="recovery-message" role="status">
            {message}
          </p>
        )}
        <p className="olvidaste">
          <Link to="/login">Volver a iniciar sesión</Link>
        </p>
      </section>
    </main>
  )
}
