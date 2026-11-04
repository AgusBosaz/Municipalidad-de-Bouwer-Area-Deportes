import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import MunicipalBrand from '../components/MunicipalBrand'
import { changeInitialPassword } from '../services/Auth'
import { clearSession, getSession } from '../services/AuthSession'
import '../styles/Login.css'
import '../styles/recovery.css'

export default function ChangeInitialPassword() {
  const [password, setPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [message, setMessage] = useState('')
  const [pending, setPending] = useState(false)
  const navigate = useNavigate()

  if (!getSession()?.mustChangePassword) {
    return <Navigate to="/login" replace />
  }

  async function handleSubmit(event) {
    event.preventDefault()

    if (password !== confirmation) {
      setMessage('Las contraseñas no coinciden.')
      return
    }

    setPending(true)
    setMessage('')

    try {
      await changeInitialPassword(password)
      clearSession()
      window.alert('Contraseña cambiada. Iniciá sesión con la nueva.')
      navigate('/login', { replace: true })
    } catch (error) {
      if (error.status === 401) {
        clearSession()
        window.alert('La sesión venció. Iniciá sesión nuevamente.')
        navigate('/login', { replace: true })
        return
      }

      setMessage(error.status === 400
        ? 'Elegí una contraseña distinta de la temporal.'
        : 'No se pudo cambiar la contraseña. Intentá nuevamente.')
    } finally {
      setPending(false)
    }
  }

  return (
    <main className="login recovery-page">
      <MunicipalBrand />
      <section className="login-derecha recovery-card">
        <h2>Cambiar contraseña inicial</h2>
        <p>Antes de continuar, elegí una contraseña personal.</p>

        <form onSubmit={handleSubmit}>
          <label className="recovery-label" htmlFor="initial-password">
            Nueva contraseña
          </label>
          <input
            id="initial-password"
            type="password"
            autoComplete="new-password"
            minLength={8}
            maxLength={128}
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />

          <label className="recovery-label" htmlFor="initial-confirmation">
            Repetir contraseña
          </label>
          <input
            id="initial-confirmation"
            type="password"
            autoComplete="new-password"
            minLength={8}
            maxLength={128}
            required
            value={confirmation}
            onChange={(event) => setConfirmation(event.target.value)}
          />

          <button type="submit" disabled={pending}>
            {pending ? 'Guardando...' : 'Cambiar contraseña'}
          </button>
        </form>

        {message && <p className="recovery-message error" role="alert">{message}</p>}
      </section>
    </main>
  )
}