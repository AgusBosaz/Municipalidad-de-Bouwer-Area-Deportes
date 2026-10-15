import { Link } from 'react-router-dom'
import '../styles/docentes.css'
import '../styles/actividades.css'

function ActividadesPage() {
  return (
    <main className="page actividades-page">
      <div className="page-header">
        <div>
          <h1>Actividades</h1>
          <p>Gestioná las actividades del Área de Deportes.</p>
        </div>

        <div className="page-header-actions">
          <input
            type="text"
            className="search-input"
            placeholder="Buscar actividad..."
          />

          <Link to="/actividades/nueva" className="primary-button">
            + Nuevo
          </Link>
        </div>
      </div>

      <section className="content-card">
        <div className="content-card-header">
          <div>
            <h2>Actividades registradas</h2>
            <p>Listado de actividades del Área de Deportes.</p>
          </div>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Categoría</th>
                <th>Horario</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>

            <tbody>
              <tr>
                <td>Fútbol Infantil</td>
                <td>Fútbol</td>
                <td>Lunes 16:00</td>
                <td>
                  <span className="status-badge">Activa</span>
                </td>
                <td>
                  <div className="table-actions">
                    <button className="action-button edit">
                      Editar
                    </button>
                    <button className="action-button delete">
                      Eliminar
                    </button>
                  </div>
                </td>
              </tr>

              <tr>
                <td>Natación Adultos</td>
                <td>Natación</td>
                <td>Martes 09:00</td>
                <td>
                  <span className="status-badge">Activa</span>
                </td>
                <td>
                  <div className="table-actions">
                    <button className="action-button edit">
                      Editar
                    </button>
                    <button className="action-button delete">
                      Eliminar
                    </button>
                  </div>
                </td>
              </tr>

              <tr>
                <td>Yoga</td>
                <td>Yoga</td>
                <td>Miércoles 18:00</td>
                <td>
                  <span className="status-badge">Activa</span>
                </td>
                <td>
                  <div className="table-actions">
                    <button className="action-button edit">
                      Editar
                    </button>
                    <button className="action-button delete">
                      Eliminar
                    </button>
                  </div>
                </td>
              </tr>

              <tr>
                <td>Básquet Juvenil</td>
                <td>Básquet</td>
                <td>Viernes 17:00</td>
                <td>
                  <span className="status-badge">Activa</span>
                </td>
                <td>
                  <div className="table-actions">
                    <button className="action-button edit">
                      Editar
                    </button>
                    <button className="action-button delete">
                      Eliminar
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="pagination">
          <button>&lt;</button>
          <button className="pagination-active">1</button>
          <button>2</button>
          <button>&gt;</button>
        </div>
      </section>
    </main>
  )
}

export default ActividadesPage