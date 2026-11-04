import { useState } from 'react'
import { Link } from 'react-router-dom'
import MunicipalBrand from '../components/MunicipalBrand'
import { resetPassword } from '../services/Auth'
import '../styles/Login.css'
import '../styles/recovery.css'

export default function ResetPassword() {
  const [token] = useState(() =>
    new URLSearchParams(window.location.hash.slice(1)).get('token'))
  const [password, setPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [message, setMessage] = useState('')
  const [pending, setPending] = useState(false)
  const [completed, setCompleted] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    if (password !== confirmation) {
      setMessage('Las contraseñas no coinciden.')
      return
    }

    setPending(true)
    setMessage('')
    try {
      await resetPassword(token, password)
      window.history.replaceState(null, '', window.location.pathname)
      setCompleted(true)
      setPassword('')
      setConfirmation('')
    } catch (error) {
      setMessage(error.status === 400
        ? 'El enlace no es válido o ya venció. Solicitá uno nuevo.'
        : error.status === 429
          ? 'Demasiados intentos. Esperá unos minutos.'
          : 'No se pudo cambiar la contraseña. Intentá nuevamente más tarde.')
    } finally {
      setPending(false)
    }
  }

  return (
    <main className="login recovery-page">
      <MunicipalBrand />
      <section className="login-derecha recovery-card" aria-labelledby="reset-title">
        <h2 id="reset-title">Nueva contraseña</h2>
        {completed ? (
          <p role="status">La contraseña se cambió correctamente. Ya podés iniciar sesión.</p>
        ) : token ? (
          <form onSubmit={handleSubmit}>
            <label className="recovery-label" htmlFor="new-password">Nueva contraseña</label>
            <input id="new-password" type="password" autoComplete="new-password"
              minLength={8} maxLength={128} required value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Nueva contraseña (mínimo 8 caracteres)" />
            <label className="recovery-label" htmlFor="confirm-password">Repetir contraseña</label>
            <input id="confirm-password" type="password" autoComplete="new-password"
              minLength={8} maxLength={128} required value={confirmation}
              onChange={(event) => setConfirmation(event.target.value)}
              placeholder="Repetir contraseña" />
            <button type="submit" disabled={pending}>
              {pending ? 'Guardando...' : 'Cambiar contraseña'}
            </button>
          </form>
        ) : (
          <p role="alert">Falta el enlace de recuperación. Solicitá uno nuevo.</p>
        )}
        {message && <p className="recovery-message error" role="alert">{message}</p>}
        <p className="olvidaste">
          <Link to={completed ? '/login' : '/recuperar-contrasena'}>
            {completed ? 'Volver a iniciar sesión' : 'Solicitar otro enlace'}
          </Link>
        </p>
      </section>
    </main>
  )
}
