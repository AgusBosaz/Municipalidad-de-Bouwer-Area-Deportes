
import { useState } from 'react'
import '../styles/actividades.css'
function CrearActividadPage({ onCancel, onSave, actividadInicial, guardando = false }) {
  const [form, setForm] = useState({
    nombre: actividadInicial?.nombre ?? '',
    categoria: actividadInicial?.categoria ?? '',
    horario: actividadInicial?.horario ?? '',
    lugar: actividadInicial?.lugar ?? '',
    cupos: actividadInicial?.cupos ?? '',
    estado: actividadInicial?.estado ?? 'Activa',
    descripcion: actividadInicial?.descripcion ?? ''
  })

  const handleChange = (e) => {
    const { name, value } = e.target

    setForm((actual) => ({
      ...actual,
      [name]: value
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!form.nombre.trim()) {
      alert('Ingresá el nombre de la actividad.')
      return
    }

    if (!form.categoria) {
      alert('Seleccioná una categoría.')
      return
    }

    if (!form.cupos || Number(form.cupos) < 1) {
      alert('Ingresá una cantidad de cupos mayor que cero.')
      return
    }

    onSave({
      ...form,
      nombre: form.nombre.trim(),
      cupos: Number(form.cupos)
    })
  }

  return (
    <section className="crear-actividad-modal-content">
      <div className="page-top">
        <div>
          <span className="page-eyebrow">ACTIVIDADES</span>
          <h2 id="activity-modal-title">
            {actividadInicial ? 'Editar actividad' : 'Nueva actividad'}
          </h2>
          <p>Completá los datos para crear una actividad.</p>
        </div>
      </div>

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
              <label htmlFor="actividad-nombre">Nombre de la actividad</label>
              <input
                id="actividad-nombre"
                type="text"
                name="nombre"
                value={form.nombre}
                onChange={handleChange}
                placeholder="Ej. Fútbol Infantil"
                maxLength={100}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="actividad-categoria">Categoría</label>
              <select
                id="actividad-categoria"
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
              <label htmlFor="actividad-cupos">Cupos máximos</label>
              <input
                id="actividad-cupos"
                type="number"
                name="cupos"
                value={form.cupos}
                onChange={handleChange}
                placeholder="Ej. 20"
                min="1"
                step="1"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="actividad-horario">Horario</label>
              <input
                id="actividad-horario"
                type="text"
                name="horario"
                value={form.horario}
                onChange={handleChange}
                placeholder="Ej. Lunes 18:00 hs"
                maxLength={100}
              />
            </div>

            <div className="form-group">
              <label htmlFor="actividad-lugar">Lugar</label>
              <input
                id="actividad-lugar"
                type="text"
                name="lugar"
                value={form.lugar}
                onChange={handleChange}
                placeholder="Ej. Polideportivo Municipal"
                maxLength={100}
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
            <label htmlFor="actividad-descripcion">Descripción</label>
            <textarea
              id="actividad-descripcion"
              name="descripcion"
              value={form.descripcion}
              onChange={handleChange}
              placeholder="Descripción de la actividad..."
              rows="3"
              maxLength={500}
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
            <label htmlFor="actividad-estado">Estado</label>
            <select
              id="actividad-estado"
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
          <button
            type="button"
            className="secondary-button"
            onClick={onCancel}
          >
            Cancelar
          </button>

          <button type="submit" className="primary-button">
            {actividadInicial ? 'Guardar cambios' : 'Guardar actividad'}
          </button>
        </div>
      </form>
    </section>
  )
}

export default CrearActividadPage
