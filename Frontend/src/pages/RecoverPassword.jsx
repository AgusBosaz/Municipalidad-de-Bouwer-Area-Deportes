import { useState } from 'react'
import { Link } from 'react-router-dom'
import MunicipalBrand from '../components/MunicipalBrand'
import { requestPasswordReset } from '../services/Auth'
import '../styles/Login.css'
import '../styles/recovery.css'

export default function RecoverPassword() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState(false)

  function handleEmailChange(event) {
    setEmail(event.target.value)
    setMessage('')
    setError(false)
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setPending(true)
    setError(false)

    try {
      await requestPasswordReset(email.trim())
      setMessage('Si el correo corresponde a una cuenta habilitada, recibirás un enlace para restablecer la contraseña.')
    } catch (requestError) {
      setError(true)
      setMessage(requestError.status === 429
        ? 'Demasiados intentos. Esperá unos minutos antes de volver a solicitar el enlace.'
        : requestError.status === 503
          ? 'El recupero por correo todavía no está disponible. Consultá con el coordinador.'
          : 'No se pudo solicitar el enlace. Intentá nuevamente más tarde.')
    } finally {
      setPending(false)
    }
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
          <button type="submit" disabled={pending}>
            {pending ? 'Enviando...' : 'Solicitar enlace'}
          </button>
        </form>
        {message && (
          <p className={`recovery-message${error ? ' error' : ''}`} role="status">
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
