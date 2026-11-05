import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { PencilLine, X } from 'lucide-react'
import { formatAttendanceDate, updateAttendance } from '../services/attendanceService'
import '../styles/attendanceHistory.css'

function textoAsistencia(presente) {
  return presente ? 'Presente' : 'Ausente'
}

function obtenerMensajeError(error) {
  if (error?.status === 403) {
    return 'No tenés permiso para modificar esta asistencia.'
  }

  try {
    const data = JSON.parse(error?.message ?? '')
    if (data?.message) return data.message
  } catch {
    // La API respondió texto plano o no hubo respuesta.
  }

  return 'No se pudo guardar el cambio. Revisá la conexión e intentá de nuevo.'
}

// Detalle de una clase del historial (actividad + fecha) con opción de editar.
// record = { id, activityId, activityName, date, students: [{ id, studentActivityId, name, document, present }] }
function AttendanceDetailModal({
  record,
  startInEditMode = false,
  canEdit = true,
  onClose,
  onSaved,
}) {
  const [editando, setEditando] = useState(canEdit && startInEditMode)
  // cambios guarda solo lo que se modificó: { [attendanceId]: nuevoValorIsPresent }
  const [cambios, setCambios] = useState({})
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')
  const [mensaje, setMensaje] = useState('')

  const estadoActual = (student) => cambios[student.id] ?? student.present

  const modificados = record.students.filter(
    (student) => cambios[student.id] !== undefined,
  )
  const hayCambios = modificados.length > 0
  const presentes = record.students.filter(estadoActual).length
  const ausentes = record.students.length - presentes
  const fecha = formatAttendanceDate(record.date)

  function solicitarCierre() {
    if (guardando) return

    if (hayCambios &&
      !window.confirm('Tenés cambios sin guardar. ¿Querés cerrar el detalle igual?')) {
      return
    }

    onClose()
  }

  // Escape cierra el detalle (si hay cambios, primero pregunta).
  const cerrarRef = useRef(solicitarCierre)
  useEffect(() => {
    cerrarRef.current = solicitarCierre
  })

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') cerrarRef.current()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  function marcar(student, presente) {
    setCambios((actuales) => {
      const siguientes = { ...actuales }

      // Si vuelve al valor original deja de contar como cambio.
      if (presente === student.present) {
        delete siguientes[student.id]
      } else {
        siguientes[student.id] = presente
      }

      return siguientes
    })
    setMensaje('')
    setError('')
  }

  function iniciarEdicion() {
    setEditando(true)
    setMensaje('')
    setError('')
  }

  function cancelarEdicion() {
    if (hayCambios &&
      !window.confirm('¿Querés descartar los cambios de asistencia?')) {
      return
    }

    setCambios({})
    setEditando(false)
    setError('')
  }

  async function guardarCambios() {
    const detalle = modificados
      .map((student) =>
        student.name + ': ' + textoAsistencia(student.present) +
        ' → ' + textoAsistencia(cambios[student.id]))
      .join('\n')

    const confirmar = window.confirm(
      '¿Confirmás modificar la asistencia de ' + record.activityName +
      ' del ' + fecha + '?\n\n' + detalle,
    )
    if (!confirmar) return

    setGuardando(true)
    setError('')
    setMensaje('')

    const resultados = await Promise.allSettled(
      modificados.map((student) =>
        updateAttendance(student.id, {
          studentActivityId: student.studentActivityId,
          date: record.date,
          isPresent: cambios[student.id],
        }),
      ),
    )

    const idsFallidos = new Set()
    let primerError = null

    resultados.forEach((resultado, index) => {
      if (resultado.status === 'rejected') {
        idsFallidos.add(modificados[index].id)
        if (!primerError) primerError = resultado.reason
      }
    })

    const guardados = resultados.length - idsFallidos.size
    let vistaActualizada = true

    if (guardados > 0) {
      try {
        await onSaved?.()
      } catch {
        vistaActualizada = false
      }
    }

    // Quedan pendientes solo los cambios que fallaron.
    setCambios((actuales) => Object.fromEntries(
      Object.entries(actuales).filter(([id]) => idsFallidos.has(Number(id))),
    ))
    setGuardando(false)

    if (idsFallidos.size === 0) {
      setEditando(false)
      setMensaje(vistaActualizada
        ? (guardados === 1
          ? 'Se actualizó 1 asistencia.'
          : `Se actualizaron ${guardados} asistencias.`)
        : 'Los cambios se guardaron, pero no se pudo actualizar la vista. Recargá la página.')
      return
    }

    setError(
      `${obtenerMensajeError(primerError)} ` +
      `(${idsFallidos.size} de ${resultados.length} sin guardar).`,
    )
  }

  return createPortal(
    <div
      className="attendance-detail-overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) solicitarCierre()
      }}
    >
      <section
        className="attendance-detail-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="attendance-detail-title"
      >
        <header className="attendance-detail-header">
          <div>
            <h2 id="attendance-detail-title">
              {editando ? 'Editar asistencia' : 'Detalle de asistencia'}
            </h2>
            <p>{record.activityName}</p>
          </div>

          <button
            type="button"
            className="attendance-detail-close"
            aria-label="Cerrar detalle"
            onClick={solicitarCierre}
            disabled={guardando}
          >
            <X size={22} />
          </button>
        </header>

        <div className="attendance-detail-meta">
          <p>
            <strong>Fecha:</strong> {fecha}
          </p>
          <p>
            <strong>Presentes:</strong> {presentes} · <strong>Ausentes:</strong> {ausentes}
          </p>
        </div>

        {editando && (
          <p className="attendance-edit-hint">
            Tocá <strong>Presente</strong> o <strong>Ausente</strong> para corregir a cada
            alumno. Los cambios se guardan cuando confirmás.
          </p>
        )}

        {record.students.length > 0 ? (
          <div className="table-container attendance-detail-table-container">
            <table>
              <thead>
                <tr>
                  <th>Alumno/a</th>
                  <th>DNI</th>
                  <th>Asistencia</th>
                </tr>
              </thead>
              <tbody>
                {record.students.map((student) => {
                  const presente = estadoActual(student)
                  const modificado = cambios[student.id] !== undefined

                  return (
                    <tr
                      key={student.id}
                      className={modificado ? 'attendance-row-changed' : ''}
                    >
                      <td>{student.name}</td>
                      <td>{student.document}</td>
                      <td>
                        {editando ? (
                          <div className="attendance-edit-cell">
                            <div
                              className="attendance-toggle"
                              role="group"
                              aria-label={'Asistencia de ' + student.name}
                            >
                              <button
                                type="button"
                                className={presente ? 'is-present' : ''}
                                aria-pressed={presente}
                                disabled={guardando}
                                onClick={() => marcar(student, true)}
                              >
                                Presente
                              </button>
                              <button
                                type="button"
                                className={!presente ? 'is-absent' : ''}
                                aria-pressed={!presente}
                                disabled={guardando}
                                onClick={() => marcar(student, false)}
                              >
                                Ausente
                              </button>
                            </div>
                            {modificado && (
                              <span className="attendance-change-note">
                                Antes: {textoAsistencia(student.present)}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span
                            className={`attendance-status ${presente
                              ? 'status-registered'
                              : 'status-pending'
                              }`}
                          >
                            {textoAsistencia(presente)}
                          </span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="attendance-detail-empty">
            Todavía no hay alumnos registrados en este registro de asistencia.
          </p>
        )}

        {mensaje && (
          <p className="attendance-detail-feedback is-success" role="status">
            {mensaje}
          </p>
        )}
        {error && (
          <p className="attendance-detail-feedback is-error" role="alert">
            {error}
          </p>
        )}

        <footer className="attendance-detail-footer">
          {editando ? (
            <>
              <button
                type="button"
                className="attendance-secondary-button"
                onClick={cancelarEdicion}
                disabled={guardando}
              >
                Cancelar edición
              </button>
              <button
                type="button"
                className="attendance-close-button"
                onClick={guardarCambios}
                disabled={!hayCambios || guardando}
              >
                {guardando
                  ? 'Guardando...'
                  : `Guardar cambios${hayCambios ? ` (${modificados.length})` : ''}`}
              </button>
            </>
          ) : (
            <>
              {canEdit && record.students.length > 0 && (
                <button
                  type="button"
                  className="attendance-secondary-button"
                  onClick={iniciarEdicion}
                >
                  <PencilLine size={16} />
                  Editar asistencia
                </button>
              )}
              <button
                type="button"
                className="attendance-close-button"
                onClick={solicitarCierre}
              >
                Cerrar
              </button>
            </>
          )}
        </footer>
      </section>
    </div>,
    document.body,
  )
}

export default AttendanceDetailModal
