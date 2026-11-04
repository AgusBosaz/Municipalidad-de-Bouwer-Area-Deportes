import { useState } from 'react'
import '../styles/actividades.css'

function CrearActividadPage({ onCancel, onSave, actividadInicial, guardando, docentes, cargandoDocentes, errorDocentes, }) {
  const [form, setForm] = useState({
    name: actividadInicial?.name ?? '',
    category: actividadInicial?.category?.toString() ?? '',
    startTime: actividadInicial?.startTime?.slice(0, 5) ?? '',
    endTime: actividadInicial?.endTime?.slice(0, 5) ?? '',
    days: actividadInicial?.days ?? 0,
    location: actividadInicial?.location ?? '',
    maximumCapacity: actividadInicial?.maximumCapacity ?? '',
  })
  const [docenteId, setDocenteId] = useState('')

  const handleChange = (e) => {
    const { name, value } = e.target

    setForm((actual) => ({
      ...actual,
      [name]: value
    }))
  }

  const handleDayChange = (dayValue) => {
    setForm((actual) => ({
      ...actual,
      days: actual.days ^ dayValue,
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!form.name.trim()) {
      alert('Ingresá el nombre de la actividad.')
      return
    }

    if (form.category === '') {
      alert('Seleccioná una categoría de edad.')
      return
    }

    if (form.days === 0) {
      alert('Seleccioná al menos un día.')
      return
    }

    if (!form.startTime || !form.endTime || form.endTime <= form.startTime) {
      alert('Ingresá un horario de fin posterior al horario de inicio.')
      return
    }

    if (!form.location.trim()) {
      alert('Ingresá el lugar de la actividad.')
      return
    }

    const capacity = Number(form.maximumCapacity)

    if (!Number.isInteger(capacity) || capacity < 1 || capacity > 500) {
      alert('Ingresá una cantidad de cupos entre 1 y 500.')
      return
    }

    onSave({
      ...form,
      name: form.name.trim(),
      category: Number(form.category),
      location: form.location.trim(),
      maximumCapacity: capacity,
    }, docenteId)
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
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Ej. Fútbol Infantil"
                maxLength={100}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="actividad-categoria">Categoría de edad</label>
              <select
                id="actividad-categoria"
                name="category"
                value={form.category}
                onChange={handleChange}
                required
              >
                <option value="">Seleccionar categoría</option>
                <option value="0">Niños</option>
                <option value="1">Adolescentes</option>
                <option value="2">Adultos mayores</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="actividad-cupos">Cupos máximos</label>
              <input
                id="actividad-cupos"
                type="number"
                name="maximumCapacity"
                value={form.maximumCapacity}
                onChange={handleChange}
                placeholder="Ej. 20"
                min="1"
                max="500"
                step="1"
                required
              />
            </div>

            <div className="form-group form-group-full">
              <fieldset>
                <legend>Días de la actividad</legend>

                {[
                  { label: 'Lunes', value: 1 },
                  { label: 'Martes', value: 2 },
                  { label: 'Miércoles', value: 4 },
                  { label: 'Jueves', value: 8 },
                  { label: 'Viernes', value: 16 },
                  { label: 'Sábado', value: 32 },
                  { label: 'Domingo', value: 64 },
                ].map((day) => (
                  <label key={day.value}>
                    <input
                      type="checkbox"
                      checked={(form.days & day.value) !== 0}
                      onChange={() => handleDayChange(day.value)}
                    />
                    {day.label}
                  </label>
                ))}
              </fieldset>
            </div>

            <div className="form-group">
              <label htmlFor="actividad-inicio">Hora de inicio</label>
              <input
                id="actividad-inicio"
                type="time"
                name="startTime"
                value={form.startTime}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="actividad-fin">Hora de fin</label>
              <input
                id="actividad-fin"
                type="time"
                name="endTime"
                value={form.endTime}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="actividad-lugar">Lugar</label>
              <input
                id="actividad-lugar"
                type="text"
                name="location"
                value={form.location}
                onChange={handleChange}
                placeholder="Ej. Polideportivo Municipal"
                maxLength={100}
                required
              />
            </div>
            {!actividadInicial && (
              <div className="form-group form-group-full">
                <label htmlFor="actividad-docente">Docente (opcional)</label>
                <select
                  id="actividad-docente"
                  value={docenteId}
                  onChange={(e) => setDocenteId(e.target.value)}
                  disabled={cargandoDocentes || Boolean(errorDocentes)}
                >
                  <option value="">Sin docente por ahora</option>
                  {docentes.map((docente) => (
                    <option key={docente.id} value={docente.id}>
                      {docente.firstName} {docente.lastName}
                    </option>
                  ))}
                </select>

                {cargandoDocentes && <p>Cargando docentes...</p>}
                {errorDocentes && <p role="alert">{errorDocentes}</p>}
              </div>
            )}
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

          <button
            type="submit"
            className="primary-button"
            disabled={guardando}
          >
            {guardando
              ? 'Guardando...'
              : actividadInicial
                ? 'Guardar cambios'
                : 'Guardar actividad'}
          </button>
        </div>
      </form>
    </section>
  )
}

export default CrearActividadPage
