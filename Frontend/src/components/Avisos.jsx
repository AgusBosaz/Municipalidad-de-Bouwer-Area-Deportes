import { useCallback, useEffect, useRef, useState } from 'react'
import { AlertCircle, CheckCircle2, CircleHelp, Info } from 'lucide-react'
import { AvisosContext } from './AvisosContext'
import '../styles/avisos.css'

function tipoDeMensaje(mensaje) {
  const texto = mensaje.toLocaleLowerCase('es')
  if (/pero no|avisos:/.test(texto)) return 'advertencia'
  if (/no se pudo|incorrect|inválid|inactivo|ya existe|venció|demasiados intentos/.test(texto)) return 'error'
  if (/correctamente|fue creada|fue dada de baja|contraseña cambiada|creada y docente asignado/.test(texto)) return 'exito'
  return 'advertencia'
}

function DialogoAviso({ aviso, onClose }) {
  const dialogRef = useRef(null)

  useEffect(() => {
    const dialog = dialogRef.current
    dialog.showModal()
    return () => { if (dialog.open) dialog.close() }
  }, [])

  const Icono = {
    exito: CheckCircle2,
    error: AlertCircle,
    advertencia: AlertCircle,
    confirmar: CircleHelp,
    info: Info,
  }[aviso.tipo] || Info
  const titulo = {
    exito: '¡Listo!',
    error: 'No se pudo completar',
    advertencia: 'Atención',
    confirmar: 'Confirmar acción',
    info: 'Información',
  }[aviso.tipo] || 'Información'

  return (
    <dialog
      ref={dialogRef}
      className={`aviso-dialog aviso-dialog--${aviso.tipo}`}
      aria-labelledby="aviso-titulo"
      aria-describedby="aviso-mensaje"
      onCancel={(event) => { event.preventDefault(); onClose(false) }}
    >
      <div className="aviso-icono"><Icono size={26} aria-hidden="true" /></div>
      <h2 id="aviso-titulo">{titulo}</h2>
      <p id="aviso-mensaje" className="aviso-mensaje">{aviso.mensaje}</p>
      <div className="aviso-acciones">
        {aviso.tipo === 'confirmar' && (
          <button type="button" className="aviso-boton aviso-boton--secundario" onClick={() => onClose(false)} autoFocus>
            Cancelar
          </button>
        )}
        <button type="button" className="aviso-boton aviso-boton--principal" onClick={() => onClose(true)} autoFocus={aviso.tipo !== 'confirmar'}>
          {aviso.tipo === 'confirmar' ? 'Confirmar' : 'Entendido'}
        </button>
      </div>
    </dialog>
  )
}

export function AvisosProvider({ children }) {
  const [actual, setActual] = useState(null)
  const cola = useRef([])

  const abrir = useCallback((mensaje, tipo) => new Promise((resolve) => {
    const aviso = { mensaje, tipo, resolve }
    cola.current.push(aviso)
    setActual((anterior) => anterior || cola.current[0])
  }), [])

  const cerrar = useCallback((respuesta) => {
    const aviso = cola.current.shift()
    aviso?.resolve(respuesta)
    setActual(cola.current[0] || null)
  }, [])

  useEffect(() => () => {
    cola.current.splice(0).forEach((aviso) => aviso.resolve(false))
  }, [])

  const avisar = useCallback((mensaje, tipo) => abrir(mensaje, tipo || tipoDeMensaje(mensaje)), [abrir])
  const preguntar = useCallback((mensaje) => abrir(mensaje, 'confirmar'), [abrir])

  return (
    <AvisosContext.Provider value={{ avisar, preguntar }}>
      {children}
      {actual && <DialogoAviso key={actual.mensaje} aviso={actual} onClose={cerrar} />}
    </AvisosContext.Provider>
  )
}
