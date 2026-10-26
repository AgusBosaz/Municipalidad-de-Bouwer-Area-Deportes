import { Link } from 'react-router-dom'

import '../styles/docentes.css'

function CrearDocentePage() {
  return (
    <main className="page docentes-page">

      <div className="page-header">
        <div>
          <h1>
            Crear docente
          </h1>

          <p>
            Registrá un nuevo docente en el Área de Deportes.
          </p>
        </div>

        <Link
          to="/docentes"
          className="secondary-button"
        >
          Volver
        </Link>
      </div>

      <section className="form-card">

        <div className="form-photo">

          <div className="form-photo-circle">
            📷
          </div>

          <button type="button">
            Subir foto
          </button>

        </div>

        <form>

          <div className="form-grid">

            <div className="form-group">
              <label htmlFor="nombre">
                Nombre *
              </label>

              <input
                id="nombre"
                type="text"
                placeholder="Ej: Karina Salto"
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">
                Email *
              </label>

              <input
                id="email"
                type="email"
                placeholder="ejemplo@mail.com"
              />
            </div>

            <div className="form-group">
              <label htmlFor="especialidad">
                Especialidad *
              </label>

              <select id="especialidad">
                <option value="">
                  Opción
                </option>

                <option value="futbol">
                  Fútbol
                </option>

                <option value="natacion">
                  Natación
                </option>

                <option value="yoga">
                  Yoga
                </option>

                <option value="basquet">
                  Básquet
                </option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="telefono">
                Teléfono *
              </label>

              <input
                id="telefono"
                type="tel"
                placeholder="Ej: 351 1234567"
              />
            </div>

          </div>

          <div className="form-actions">

            <Link
              to="/docentes"
              className="secondary-button"
            >
              Cancelar
            </Link>

            <button
              type="submit"
              className="primary-button"
            >
              Guardar
            </button>

          </div>

        </form>

      </section>

    </main>
  )
}

export default CrearDocentePage