import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import '../styles/actividades.css'

function CrearActividadPage() {
  const navigate = useNavigate()

  const [form, setForm] = useState({
    nombre: '',
    categoria: '',
    horario: '',
    lugar: '',
    cupos: '',
    estado: 'Activa',
    descripcion: ''
  })

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    navigate('/actividades')
  }

  return (
    <section className="actividades-page">

      <div className="page-top">
        <div>
          <span className="page-eyebrow">ACTIVIDADES</span>
          <h2>Nueva actividad</h2>
          <p>Completá los datos para crear una actividad.</p>
        </div>
      </div>

      <div className="form-card">

        <form onSubmit={handleSubmit}>

          <div className="form-section">

            <div className="form-section-title">
              <span>01</span>

              <div>
                <h3>Información general</h3>
                <p>Datos principales de la actividad.</p>
              </div>
            </div>

            <div className="form-grid">

              <div className="form-group form-group-full">
                <label>Nombre de la actividad</label>

                <input
                  type="text"
                  name="nombre"
                  value={form.nombre}
                  onChange={handleChange}
                  placeholder="Ej. Fútbol"
                  required
                />
              </div>

              <div className="form-group">
                <label>Categoría</label>

                <select
                  name="categoria"
                  value={form.categoria}
                  onChange={handleChange}
                  required
                >
                  <option value="">Seleccionar categoría</option>
                  <option value="Deportes">Deportes</option>
                  <option value="Salud">Salud</option>
                  <option value="Bienestar">Bienestar</option>
                </select>
              </div>

              <div className="form-group">
                <label>Cupos</label>

                <input
                  type="number"
                  name="cupos"
                  value={form.cupos}
                  onChange={handleChange}
                  placeholder="Ej. 20"
                  min="1"
                />
              </div>

              <div className="form-group">
                <label>Horario</label>

                <input
                  type="text"
                  name="horario"
                  value={form.horario}
                  onChange={handleChange}
                  placeholder="Ej. Lunes 18:00 hs"
                />
              </div>

              <div className="form-group">
                <label>Lugar</label>

                <input
                  type="text"
                  name="lugar"
                  value={form.lugar}
                  onChange={handleChange}
                  placeholder="Ej. Polideportivo Municipal"
                />
              </div>

            </div>

          </div>

          <div className="form-section">

            <div className="form-section-title">
              <span>02</span>

              <div>
                <h3>Descripción</h3>
                <p>Agregá información adicional.</p>
              </div>
            </div>

            <div className="form-group">

              <label>Descripción</label>

              <textarea
                name="descripcion"
                value={form.descripcion}
                onChange={handleChange}
                placeholder="Descripción de la actividad..."
                rows="5"
              />

            </div>

          </div>

          <div className="form-section">

            <div className="form-section-title">
              <span>03</span>

              <div>
                <h3>Estado</h3>
                <p>Definí si la actividad estará disponible.</p>
              </div>
            </div>

            <div className="form-group">

              <label>Estado</label>

              <select
                name="estado"
                value={form.estado}
                onChange={handleChange}
              >
                <option value="Activa">Activa</option>
                <option value="Inactiva">Inactiva</option>
              </select>

            </div>

          </div>

          <div className="form-actions">

            <Link to="/actividades" className="secondary-button">
              Cancelar
            </Link>

            <button type="submit" className="primary-button">
              Guardar actividad
            </button>

          </div>

        </form>

      </div>

    </section>
  )
}

export default CrearActividadPage