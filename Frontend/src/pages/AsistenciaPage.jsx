import '../styles/docentes.css'
import '../styles/asistencia.css'

function AsistenciaPage() {
  return (
    <main className="page asistencia-page">
      <div className="page-header">
        <div>
          <h1>Asistencia</h1>
          <p>Registrá la asistencia de los participantes.</p>
        </div>
      </div>

      <section className="content-card">
        <div className="content-card-header">
          <div>
            <h2>Registro de asistencia</h2>
            <p>Seleccioná la actividad y registrá la asistencia.</p>
          </div>
        </div>

        <div className="form-grid asistencia-filtros">
          <div className="form-group">
            <label htmlFor="actividad">
              Actividad
            </label>

            <select id="actividad">
              <option>Fútbol Infantil</option>
              <option>Natación Adultos</option>
              <option>Yoga</option>
              <option>Básquet Juvenil</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="fecha">
              Fecha
            </label>

            <input
              id="fecha"
              type="date"
            />
          </div>
        </div>

        <div className="table-container asistencia-table">
          <table>
            <thead>
              <tr>
                <th>Participante</th>
                <th>Presente</th>
              </tr>
            </thead>

            <tbody>
              <tr>
                <td>Juan López</td>
                <td>
                  <input type="checkbox" />
                </td>
              </tr>

              <tr>
                <td>Martina Gómez</td>
                <td>
                  <input type="checkbox" />
                </td>
              </tr>

              <tr>
                <td>Tomás Pérez</td>
                <td>
                  <input type="checkbox" />
                </td>
              </tr>

              <tr>
                <td>Sofía Castro</td>
                <td>
                  <input type="checkbox" />
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="form-actions">
          <button className="primary-button">
            Guardar asistencia
          </button>
        </div>
      </section>
    </main>
  )
}

export default AsistenciaPage