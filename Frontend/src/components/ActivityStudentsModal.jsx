import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { getAttendanceStudents } from '../services/attendanceService'

export default function ActivityStudentsModal({ activity, onClose }) {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const closeRef = useRef(null)
  const onCloseRef = useRef(onClose)

  useEffect(() => {
    onCloseRef.current = onClose
  }, [onClose])

  useEffect(() => {
    let active = true
    const previousFocus = document.activeElement
    closeRef.current?.focus()

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onCloseRef.current()
    }
    document.addEventListener('keydown', handleKeyDown)

    getAttendanceStudents(activity.id)
      .then((data) => { if (active) setStudents(data) })
      .catch(() => { if (active) setError('No se pudieron cargar los alumnos. Intentá nuevamente.') })
      .finally(() => { if (active) setLoading(false) })

    return () => {
      active = false
      document.removeEventListener('keydown', handleKeyDown)
      previousFocus?.focus()
    }
  }, [activity.id])

  return createPortal(
    <div
      className="activity-modal-overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <section
        className="activity-modal activity-students-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="activity-students-title"
      >
        <button
          ref={closeRef}
          type="button"
          className="activity-modal-close"
          aria-label="Cerrar"
          onClick={onClose}
        >
          ×
        </button>
        <h2 id="activity-students-title">Alumnos inscriptos</h2>
        <p className="activity-students-name">{activity.name}</p>

        {loading ? (
          <p role="status">Cargando alumnos...</p>
        ) : error ? (
          <p role="alert">{error}</p>
        ) : students.length === 0 ? (
          <p>No hay alumnos inscriptos en esta actividad.</p>
        ) : (
          <>
            <p>{students.length} {students.length === 1 ? 'alumno inscripto' : 'alumnos inscriptos'}</p>
            <ul className="activity-students-list">
              {students.map((student) => (
                <li key={student.studentActivityId}>
                  <strong>{student.firstName} {student.lastName}</strong>
                  <span>DNI: {student.dni}</span>
                </li>
              ))}
            </ul>
          </>
        )}
      </section>
    </div>,
    document.body,
  )
}
