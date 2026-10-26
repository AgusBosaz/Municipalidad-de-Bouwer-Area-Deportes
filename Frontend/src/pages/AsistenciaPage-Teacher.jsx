import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  UsersRound,
} from 'lucide-react'
import '../styles/Asistencia.css'
import '../styles/Docente.css'

const actividades = {
  '1': {
    nombre: 'Fútbol Infantil',
    horario: 'Lunes y miércoles · 16:00 a 17:00 hs',
    alumnos: [
      { id: 101, nombre: 'Juan López', documento: '45.120.321' },
      { id: 102, nombre: 'Martina Gómez', documento: '46.201.442' },
      { id: 103, nombre: 'Tomás Pérez', documento: '45.876.123' },
      { id: 104, nombre: 'Sofía Castro', documento: '46.008.912' },
      { id: 105, nombre: 'Valentín Ruiz', documento: '45.734.812' },
    ],
  },

  '2': {
    nombre: 'Natación Adultos',
    horario: 'Martes y jueves · 09:00 a 10:00 hs',
    alumnos: [
      { id: 201, nombre: 'Carolina Díaz', documento: '30.120.321' },
      { id: 202, nombre: 'Martín Sosa', documento: '28.201.442' },
      { id: 203, nombre: 'Paula Romero', documento: '32.876.123' },
    ],
  },
}

function fechaLocal() {
  const ahora = new Date()
  const offset = ahora.getTimezoneOffset()

  return new Date(
    ahora.getTime() - offset * 60000,
  ).toISOString().slice(0, 10)
}

function crearAsistencia(alumnos = []) {
  const inicial = {}

  alumnos.forEach((alumno) => {
    inicial[alumno.id] = false
  })

  return inicial
}

function AsistenciaPage() {
  const { actividadId } = useParams()
  const navigate = useNavigate()

  const actividad = actividades[actividadId]

  const [fecha, setFecha] = useState(fechaLocal)
  const [asistencia, setAsistencia] = useState(
    () => crearAsistencia(actividad?.alumnos),
  )
  const [guardado, setGuardado] = useState(false)

  useEffect(() => {
    setAsistencia(crearAsistencia(actividad?.alumnos))
    setGuardado(false)
  }, [actividadId])

  const presentes = useMemo(
    () => Object.values(asistencia).filter(Boolean).length,
    [asistencia],
  )

  if (!actividad) {
    return (
      <section className="page asistencia-page">
        <div className="content-card docente-not-found">
          <h1>Actividad no encontrada</h1>

          <p>
            No encontramos esa actividad en esta vista.
          </p>

          <Link
            className="primary-button"
            to="/mis-actividades"
          >
            Volver a mis actividades
          </Link>
        </div>
      </section>
    )
  }

  function cambiarAsistencia(id, presente) {
    setAsistencia((actual) => ({
      ...actual,
      [id]: presente,
    }))

    setGuardado(false)
  }

  function guardarAsistencia() {
    if (!fecha) {
      window.alert('Seleccioná una fecha para la asistencia.')
      return
    }

    const confirmar = window.confirm(
      `¿Confirmás guardar la asistencia de ${actividad.nombre} ` +
      `del ${fecha}?\n\n` +
      `Presentes: ${presentes} de ${actividad.alumnos.length}.`,
    )

    if (!confirmar) return

    // TODO: conectar con el endpoint de asistencia del backend.
    setGuardado(true)

    window.alert(
      'La asistencia se confirmó en esta vista de demostración. ' +
      'Todavía no se envió al servidor.',
    )
  }

  function cancelar() {
    const confirmar = window.confirm(
      '¿Querés cancelar y descartar los cambios de asistencia?',
    )

    if (confirmar) {
      navigate('/mis-actividades')
    }
  }

  return (
    <section className="page asistencia-page">
      <div className="page-header">
        <div>
          <Link
            to="/mis-actividades"
            className="docente-back-link"
          >
            <ArrowLeft size={16} />
            Mis actividades
          </Link>

          <h1>Tomar asistencia</h1>

          <p>
            Revisá los alumnos inscriptos y marcá quiénes asistieron.
          </p>
        </div>
      </div>

      <section className="content-card asistencia-content-card">
        <div className="asistencia-activity-summary">
          <div className="docente-activity-symbol">
            <CalendarDays size={22} />
          </div>

          <div>
            <span className="docente-card-label">
              ACTIVIDAD ASIGNADA
            </span>

            <h2>{actividad.nombre}</h2>
            <p>{actividad.horario}</p>
          </div>
        </div>

        <div className="asistencia-meta-row">
          <div className="form-group">
            <label htmlFor="fecha-asistencia">
              Fecha de asistencia
            </label>

            <input
              id="fecha-asistencia"
              type="date"
              value={fecha}
              onChange={(event) => {
                setFecha(event.target.value)
                setGuardado(false)
              }}
              max={fechaLocal()}
              required
            />
          </div>

          <div className="asistencia-count">
            <UsersRound size={18} />

            <span>
              <strong>{actividad.alumnos.length}</strong>
              {' '}alumnos inscriptos
            </span>
          </div>

          <div className="asistencia-count">
            <CheckCircle2 size={18} />

            <span>
              <strong>{presentes}</strong>
              {' '}presentes
            </span>
          </div>
        </div>

        <div className="docente-section-heading asistencia-heading">
          <div>
            <h2>Listado de alumnos</h2>
            <p>Marcá la casilla de los alumnos presentes.</p>
          </div>

          <span className="docente-total-pill">
            {presentes}/{actividad.alumnos.length} presentes
          </span>
        </div>

        <div className="table-container asistencia-table">
          <table>
            <thead>
              <tr>
                <th>Alumno</th>
                <th>DNI</th>
                <th className="asistencia-check-heading">
                  Presente
                </th>
              </tr>
            </thead>

            <tbody>
              {actividad.alumnos.map((alumno) => (
                <tr key={alumno.id}>
                  <td>
                    <strong className="asistencia-student-name">
                      {alumno.nombre}
                    </strong>
                  </td>

                  <td>{alumno.documento}</td>

                  <td className="asistencia-check-cell">
                    <label className="asistencia-checkbox-label">
                      <input
                        type="checkbox"
                        checked={Boolean(asistencia[alumno.id])}
                        onChange={(event) =>
                          cambiarAsistencia(
                            alumno.id,
                            event.target.checked,
                          )
                        }
                        aria-label={`Marcar presente a ${alumno.nombre}`}
                      />

                      <span>
                        {asistencia[alumno.id]
                          ? 'Presente'
                          : 'Ausente'}
                      </span>
                    </label>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {guardado && (
          <p className="asistencia-success" role="status">
            Confirmación realizada en esta vista.
            El registro todavía no se guardó en el servidor.
          </p>
        )}

        <div className="form-actions asistencia-actions">
          <button
            type="button"
            className="secondary-button"
            onClick={cancelar}
          >
            Cancelar
          </button>

          <button
            type="button"
            className="primary-button"
            onClick={guardarAsistencia}
            disabled={!fecha}
          >
            Guardar asistencia
          </button>
        </div>
      </section>

      <p className="docente-demo-note">
        Datos de demostración. Para registrar la asistencia
        permanentemente, hay que conectar esta pantalla al backend.
      </p>
    </section>
  )
}

export default AsistenciaPage