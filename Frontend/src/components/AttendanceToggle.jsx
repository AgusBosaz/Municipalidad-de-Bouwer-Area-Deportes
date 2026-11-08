import '../styles/attendanceHistory.css'

export default function AttendanceToggle({ present, onChange, disabled = false, studentName }) {
  return (
    <div className="attendance-toggle" role="group" aria-label={'Asistencia de ' + studentName}>
      <button type="button" className={present ? 'is-present' : ''} aria-pressed={present}
        disabled={disabled} onClick={() => onChange(true)}>
        Presente
      </button>
      <button type="button" className={!present ? 'is-absent' : ''} aria-pressed={!present}
        disabled={disabled} onClick={() => onChange(false)}>
        Ausente
      </button>
    </div>
  )
}
