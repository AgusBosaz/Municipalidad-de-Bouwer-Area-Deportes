import { Link } from 'react-router-dom'

import '../styles/docentes.css'

function DocentesPage() {
  return (
    <main className="page docentes-page">

      <div className="page-header">
        <div>
          <h1>
            Docentes
          </h1>

          <p>
            Gestioná los docentes del Área de Deportes.
          </p>
        </div>

        <div className="page-header-actions">

          <input
            type="text"
            className="search-input"
            placeholder="Buscar docente..."
          />

          <Link
            to="/docentes/nuevo"
            className="primary-button"
          >
            + Nuevo
          </Link>

        </div>
      </div>

      <section className="content-card">

        <div className="content-card-header">

          <div>
            <h2>
              Docentes registrados
            </h2>

            <p>
              Listado de docentes del Área de Deportes.
            </p>
          </div>

        </div>

        <div className="table-container">

          <table>

            <thead>

              <tr>
                <th>
                  Nombre
                </th>

                <th>
                  Email
                </th>

                <th>
                  Especialidad
                </th>

                <th>
                  Estado
                </th>

                <th>
                  Acciones
                </th>
              </tr>

            </thead>

            <tbody>

              <tr>

                <td>
                  Santiago Pérez
                </td>

                <td>
                  santi@correo.com
                </td>

                <td>
                  Fútbol
                </td>

                <td>
                  <span className="status-badge">
                    Activo
                  </span>
                </td>

                <td>

                  <div className="table-actions">

                    <button
                      type="button"
                      className="action-button edit"
                    >
                      Editar
                    </button>

                    <button
                      type="button"
                      className="action-button delete"
                    >
                      Eliminar
                    </button>

                  </div>

                </td>

              </tr>

              <tr>

                <td>
                  María Gómez
                </td>

                <td>
                  maria@correo.com
                </td>

                <td>
                  Natación
                </td>

                <td>
                  <span className="status-badge">
                    Activo
                  </span>
                </td>

                <td>

                  <div className="table-actions">

                    <button
                      type="button"
                      className="action-button edit"
                    >
                      Editar
                    </button>

                    <button
                      type="button"
                      className="action-button delete"
                    >
                      Eliminar
                    </button>

                  </div>

                </td>

              </tr>

              <tr>

                <td>
                  Lucía Torres
                </td>

                <td>
                  lucia@correo.com
                </td>

                <td>
                  Yoga
                </td>

                <td>
                  <span className="status-badge">
                    Activo
                  </span>
                </td>

                <td>

                  <div className="table-actions">

                    <button
                      type="button"
                      className="action-button edit"
                    >
                      Editar
                    </button>

                    <button
                      type="button"
                      className="action-button delete"
                    >
                      Eliminar
                    </button>

                  </div>

                </td>

              </tr>

              <tr>

                <td>
                  Diego Castro
                </td>

                <td>
                  diego@correo.com
                </td>

                <td>
                  Básquet
                </td>

                <td>
                  <span className="status-badge">
                    Activo
                  </span>
                </td>

                <td>

                  <div className="table-actions">

                    <button
                      type="button"
                      className="action-button edit"
                    >
                      Editar
                    </button>

                    <button
                      type="button"
                      className="action-button delete"
                    >
                      Eliminar
                    </button>

                  </div>

                </td>

              </tr>

            </tbody>

          </table>

        </div>

        <div className="pagination">

          <button type="button">
            &lt;
          </button>

          <button
            type="button"
            className="pagination-active"
          >
            1
          </button>

          <button type="button">
            2
          </button>

          <button type="button">
            &gt;
          </button>

        </div>

      </section>

    </main>
  )
}

export default DocentesPage