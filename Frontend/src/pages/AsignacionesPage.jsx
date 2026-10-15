import { useState } from 'react'
import '../styles/asignaciones.css'

function AsignacionesPage() {
  const [actividad, setActividad] = useState('')
  const [docente, setDocente] = useState('')

  const [asignaciones, setAsignaciones] = useState([
    {
      id: 1,
      docente: 'María González',
      actividad: 'Fútbol',
      horario: 'Lunes y Miércoles - 18:00 hs',
      estado: 'Activa'
    },
    {
      id: 2,
      docente: 'Juan Pérez',
      actividad: 'Vóley',
      horario: 'Martes y Jueves - 18:00 hs',
      estado: 'Activa'
    },
    {
      id: 3,
      docente: 'Lucía Fernández',
      actividad: 'Gimnasia',
      horario: 'Lunes y Viernes - 17:00 hs',
      estado: 'Activa'
    }
  ])

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!actividad || !docente) {
      return
    }

    const nuevaAsignacion = {
      id: Date.now(),
      docente,
      actividad,
      horario: 'Horario a definir',
      estado: 'Activa'
    }

    setAsignaciones([
      ...asignaciones,
      nuevaAsignacion
    ])

    setActividad('')
    setDocente('')
  }

  return (
    <section className="asignaciones-page">

      <div className="page-top">
        <div>
          <span className="page-eyebrow">GESTIÓN</span>
          <h2>Asignaciones</h2>
          <p>
            Asigná docentes a las diferentes actividades deportivas.
          </p>
        </div>
      </div>

      <div className="assignment-layout">

        <div className="assignment-form-card">

          <div className="assignment-card-header">
            <div className="assignment-number">
              01
            </div>

            <div>
              <h3>Nueva asignación</h3>
              <p>
                Seleccioná una actividad y un docente.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>

            <div className="form-group">
              <label>Actividad</label>

              <select
                value={actividad}
                onChange={(e) => setActividad(e.target.value)}
                required
              >
                <option value="">
                  Seleccionar actividad
                </option>

                <option value="Fútbol">
                  Fútbol
                </option>

                <option value="Vóley">
                  Vóley
                </option>

                <option value="Gimnasia">
                  Gimnasia
                </option>

                <option value="Yoga">
                  Yoga
                </option>
              </select>
            </div>

            <div className="form-group">
              <label>Docente</label>

              <select
                value={docente}
                onChange={(e) => setDocente(e.target.value)}
                required
              >
                <option value="">
                  Seleccionar docente
                </option>

                <option value="María González">
                  María González
                </option>

                <option value="Juan Pérez">
                  Juan Pérez
                </option>

                <option value="Lucía Fernández">
                  Lucía Fernández
                </option>

                <option value="Carlos Rodríguez">
                  Carlos Rodríguez
                </option>
              </select>
            </div>

            <button
              type="submit"
              className="primary-button assignment-submit"
            >
              Crear asignación
            </button>

          </form>

        </div>

        <div className="assignment-list-card">

          <div className="assignment-list-header">

            <div>
              <span>ASIGNACIONES</span>
              <h3>Asignaciones actuales</h3>
            </div>

            <strong>
              {asignaciones.length}
            </strong>

          </div>

          <div className="assignment-list">

            {asignaciones.map((item) => (
              <div
                className="assignment-item"
                key={item.id}
              >

                <div className="assignment-avatar">
                  {item.docente.charAt(0)}
                </div>

                <div className="assignment-info">

                  <strong>
                    {item.docente}
                  </strong>

                  <span>
                    {item.actividad}
                  </span>

                  <small>
                    {item.horario}
                  </small>

                </div>

                <div className="assignment-actions">

                  <span className="status-badge status-active">
                    {item.estado}
                  </span>

                  <button>
                    ⌫
                  </button>

                </div>

              </div>
            ))}

          </div>

        </div>

      </div>

    </section>
  )
}

export default AsignacionesPage