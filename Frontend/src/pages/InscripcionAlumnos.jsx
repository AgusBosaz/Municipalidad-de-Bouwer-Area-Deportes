import { useAvisos } from '../components/AvisosContext'
import React, { useEffect, useState } from 'react';
import { getActivities } from '../services/activityService';
import { createStudent, getStudents } from '../services/studentService';
import { registerStudent, getInscriptions } from '../services/inscriptionService';
import '../styles/inscripcion.css';

export default function InscripcionAlumnos() {
  const { avisar } = useAvisos()
  const [actividades, setActividades] = useState([]);
  const [errorActividades, setErrorActividades] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [mostrarSegundoContacto, setMostrarSegundoContacto] = useState(false);
  const [errores, setErrores] = useState({});

  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    dni: '',
    fechaNacimiento: '',
    genero: '',
    telefono: '',
    direccion: '',
    contactoEmergenciaNombre: '',
    contactoEmergenciaTelefono: '',
    segundoContactoNombre: '',
    segundoContactoTelefono: '',
    actividadId: ''
  });

  const [alumnos, setAlumnos] = useState([]);
  const [versionInscripciones, setVersionInscripciones] = useState(0);
  const [errorInscripciones, setErrorInscripciones] = useState('');
  const [estudiantes, setEstudiantes] = useState([]);
  const [modoInscripcion, setModoInscripcion] = useState('nuevo');
  const [estudianteSeleccionadoId, setEstudianteSeleccionadoId] = useState('');

  useEffect(() => {
    let active = true;

    getActivities()
      .then((data) => {
        if (active) setActividades(data);
      })
      .catch(() => {
        if (active) setErrorActividades('No se pudieron cargar las actividades.');
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;

    Promise.all([getInscriptions(), getStudents()])
      .then(([inscripciones, estudiantesList]) => {
        if (!active) return;
        setErrorInscripciones('');

        setEstudiantes(estudiantesList);

        const estudiantePorId = new Map(
          estudiantesList.map((estudiante) => [estudiante.id, estudiante])
        );

        const filas = [...inscripciones]
          .sort((a, b) =>
            b.enrollmentDate.localeCompare(a.enrollmentDate) || b.id - a.id
          )
          .map((inscripcion) => ({
            id: inscripcion.id,
            nombre: inscripcion.studentName,
            dni: estudiantePorId.get(inscripcion.studentId)?.dni ?? '—',
            actividad: inscripcion.activityName,
            fecha: new Date(`${inscripcion.enrollmentDate}T00:00:00`)
              .toLocaleDateString('es-AR'),
          }));

        setAlumnos(filas);
      })
      .catch(() => {
        if (active) setErrorInscripciones('No se pudieron cargar las inscripciones.');
      });

    return () => {
      active = false;
    };
  }, [versionInscripciones]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((actual) => ({ ...actual, [name]: value }));
    setErrores((actual) => {
      if (!actual[name]) return actual;
      const siguientes = { ...actual };
      delete siguientes[name];
      return siguientes;
    });
  };

  const propsError = (campo) => ({
    'aria-invalid': Boolean(errores[campo]),
    'aria-describedby': errores[campo] ? `error-${campo}` : undefined,
  });
  const errorCampo = (campo) => errores[campo] && (
    <p id={`error-${campo}`} className="inscripcion-error-campo">{errores[campo]}</p>
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (guardando) return;

    const actividadId = Number(formData.actividadId);
    const alumnoData = {
      firstName: formData.nombre.trim(),
      lastName: formData.apellido.trim(),
      dni: formData.dni.replace(/\D/g, ''),
      birthDate: formData.fechaNacimiento,
      gender: formData.genero,
      phoneNumber: formData.telefono.trim(),
      address: formData.direccion.trim(),
      emergencyContactName: formData.contactoEmergenciaNombre.trim(),
      emergencyContactPhoneNumber: formData.contactoEmergenciaTelefono.trim(),
      additionalEmergencyContacts: mostrarSegundoContacto &&
        (formData.segundoContactoNombre.trim() || formData.segundoContactoTelefono.trim())
        ? [{ name: formData.segundoContactoNombre.trim(), phoneNumber: formData.segundoContactoTelefono.trim() }]
        : [],
    };

    const nuevosErrores = {};
    if (modoInscripcion === 'nuevo') {
      if (!alumnoData.firstName) nuevosErrores.nombre = 'Ingresá el nombre.';
      if (!alumnoData.lastName) nuevosErrores.apellido = 'Ingresá el apellido.';
      if (!alumnoData.dni) nuevosErrores.dni = 'Ingresá el DNI.';
      else if (alumnoData.dni.length < 7 || alumnoData.dni.length > 20)
        nuevosErrores.dni = 'El DNI debe tener entre 7 y 20 dígitos.';
      if (!alumnoData.birthDate) nuevosErrores.fechaNacimiento = 'Ingresá la fecha de nacimiento.';
      else {
        const hoy = new Date();
        const fechaHoy = new Date(hoy.getTime() - hoy.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
        if (alumnoData.birthDate > fechaHoy) nuevosErrores.fechaNacimiento = 'La fecha no puede ser futura.';
      }
      if (!alumnoData.gender) nuevosErrores.genero = 'Seleccioná el género.';
      if (!alumnoData.address) nuevosErrores.direccion = 'Ingresá la dirección.';
      if (!alumnoData.emergencyContactName) nuevosErrores.contactoEmergenciaNombre = 'Ingresá el nombre del contacto.';
      if (!alumnoData.emergencyContactPhoneNumber) nuevosErrores.contactoEmergenciaTelefono = 'Ingresá el teléfono del contacto.';
      if (mostrarSegundoContacto && (formData.segundoContactoNombre.trim() || formData.segundoContactoTelefono.trim())) {
        if (!formData.segundoContactoNombre.trim()) nuevosErrores.segundoContactoNombre = 'Ingresá el nombre del segundo contacto.';
        if (!formData.segundoContactoTelefono.trim()) nuevosErrores.segundoContactoTelefono = 'Ingresá el teléfono del segundo contacto.';
      }
    } else if (!estudianteSeleccionadoId) {
      nuevosErrores.estudianteExistente = 'Seleccioná un alumno.';
    }
    if (!actividadId) nuevosErrores.actividadId = 'Seleccioná una actividad.';
    setErrores(nuevosErrores);
    if (Object.keys(nuevosErrores).length > 0) {
      requestAnimationFrame(() => document.querySelector('#formulario-inscripcion [aria-invalid="true"]')?.focus());
      return;
    }
    setGuardando(true);

    let alumnoCreado = null;

    try {
      if (modoInscripcion === 'nuevo') {
        alumnoCreado = await createStudent(alumnoData);
        await registerStudent(alumnoCreado.id, actividadId);
      } else {
        await registerStudent(Number(estudianteSeleccionadoId), actividadId);
      }

      setVersionInscripciones((version) => version + 1);

      await avisar(modoInscripcion === 'nuevo'
        ? 'Alumno creado e inscripto correctamente.'
        : 'Alumno inscripto correctamente.');
      handleClear();
    } catch (error) {
      let mensajeApi = '';

      try {
        mensajeApi = JSON.parse(error.message).message ?? '';
      } catch {
        mensajeApi = '';
      }

      if (alumnoCreado) {
        await avisar(
          `El alumno se creó con ID ${alumnoCreado.id}, pero no se pudo inscribir.\n` +
          (mensajeApi ? `Motivo: ${mensajeApi}\n` : '') +
          'No repitas el alta: seleccioná “Alumno existente” para completar la inscripción.'
        );
      } else if (modoInscripcion === 'nuevo' && error.status === 409) {
        await avisar('Ya existe un usuario con ese DNI. Buscalo en “Alumno existente”.');
      } else {
        await avisar(mensajeApi || (
          modoInscripcion === 'existente'
            ? 'No se pudo inscribir al alumno en la actividad.'
            : 'No se pudo crear el alumno. Intentá nuevamente.'
        ));
      }
    } finally {
      setGuardando(false);
    }
  };

  const handleClear = () => {
    setFormData({
      nombre: '',
      apellido: '',
      dni: '',
      fechaNacimiento: '',
      genero: '',
      telefono: '',
      direccion: '',
      contactoEmergenciaNombre: '',
      contactoEmergenciaTelefono: '',
      segundoContactoNombre: '',
      segundoContactoTelefono: '',
      actividadId: ''
    });
    setEstudianteSeleccionadoId('');
    setMostrarSegundoContacto(false);
    setErrores({});
  };

  return (
    <div className="inscripcion-container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div className="inscripcion-header">
        <h1>Inscripción de Alumnos</h1>
        <p>Complete el formulario para incorporar un participante a una actividad.</p>
      </div>

      {/* Tarjeta del Formulario */}
      <div className="inscripcion-card">
        <h2>
          {modoInscripcion === 'nuevo'
            ? 'Datos generales del alumno'
            : 'Inscribir alumno registrado'}
        </h2>

        <div className="form-actions" role="group" aria-label="Tipo de inscripción" style={{ marginBottom: '1.5rem' }}>
          <button
            type="button"
            className={modoInscripcion === 'nuevo' ? 'btn-primary' : 'btn-secondary'}
            aria-pressed={modoInscripcion === 'nuevo'}
            onClick={() => { setModoInscripcion('nuevo'); setErrores({}); }}
          >
            Alumno nuevo
          </button>

          <button
            type="button"
            className={modoInscripcion === 'existente' ? 'btn-primary' : 'btn-secondary'}
            aria-pressed={modoInscripcion === 'existente'}
            onClick={() => { setModoInscripcion('existente'); setErrores({}); }}
          >
            Alumno existente
          </button>
        </div>

        <form id="formulario-inscripcion" onSubmit={handleSubmit} className="form-grid" noValidate>
          {modoInscripcion === 'nuevo' ? (
            <>
              <div className="form-group">
                <label htmlFor="nombre">Nombre *</label>
                <input id="nombre"
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  placeholder="Ej. Alan"
                {...propsError('nombre')} />
                {errorCampo('nombre')}
              </div>
              <div className="form-group">
                <label htmlFor="apellido">Apellido *</label>
                <input id="apellido"
                  type="text"
                  name="apellido"
                  value={formData.apellido}
                  onChange={handleChange}
                  placeholder="Ej. Gómez"
                {...propsError('apellido')} />
                {errorCampo('apellido')}
              </div>
              <div className="form-group">
                <label htmlFor="dni">DNI / Documento *</label>
                <input id="dni"
                  type="text"
                  name="dni"
                  value={formData.dni}
                  onChange={handleChange}
                  placeholder="Ej. 45123882"
                {...propsError('dni')} />
                {errorCampo('dni')}
              </div>
              <div className="form-group">
                <label htmlFor="fechaNacimiento">Fecha de Nacimiento *</label>
                <input id="fechaNacimiento"
                  type="date"
                  name="fechaNacimiento"
                  value={formData.fechaNacimiento}
                  onChange={handleChange}
                {...propsError('fechaNacimiento')} />
                {errorCampo('fechaNacimiento')}
              </div>
              <div className="form-group">
                <label htmlFor="genero">Género *</label>
                <select {...propsError('genero')}
                  id="genero"
                  name="genero"
                  value={formData.genero}
                  onChange={handleChange}
                >
                  <option value="">Seleccionar género</option>
                  <option value="Femenino">Femenino</option>
                  <option value="Masculino">Masculino</option>
                  <option value="Otro">Otro</option>
                </select>
              {errorCampo('genero')}
              </div>

              <div className="form-group">
                <label htmlFor="telefono">Teléfono del alumno (opcional)</label>
                <input
                  id="telefono"
                  type="tel"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleChange}
                  placeholder="Ej. 3511234567"
                />
              </div>

              <div className="form-group">
                <label htmlFor="direccion">Dirección *</label>
                <input
                  id="direccion"
                  type="text"
                  name="direccion"
                  value={formData.direccion}
                  onChange={handleChange}
                  placeholder="Ej. San Martín 123"
                {...propsError('direccion')} />
                {errorCampo('direccion')}
              </div>
              <div className="form-group">
                <label htmlFor="contactoEmergenciaNombre">Nombre del contacto de emergencia *</label>
                <input
                  id="contactoEmergenciaNombre"
                  type="text"
                  name="contactoEmergenciaNombre"
                  value={formData.contactoEmergenciaNombre}
                  onChange={handleChange}
                  placeholder="Ej. María Gómez"
                {...propsError('contactoEmergenciaNombre')} />
                {errorCampo('contactoEmergenciaNombre')}
              </div>

              <div className="form-group">
                <label htmlFor="contactoEmergenciaTelefono">Teléfono del contacto de emergencia *</label>
                <input
                  id="contactoEmergenciaTelefono"
                  type="tel"
                  name="contactoEmergenciaTelefono"
                  value={formData.contactoEmergenciaTelefono}
                  onChange={handleChange}
                  placeholder="Ej. 3511234567"
                {...propsError('contactoEmergenciaTelefono')} />
                {errorCampo('contactoEmergenciaTelefono')}
              </div>
              <div className="inscripcion-contacto-adicional">
                <button
                  type="button"
                  className="btn-secondary"
                  aria-expanded={mostrarSegundoContacto}
                  aria-controls="segundo-contacto"
                  onClick={() => {
                    if (mostrarSegundoContacto) {
                      setFormData((actual) => ({ ...actual, segundoContactoNombre: '', segundoContactoTelefono: '' }));
                    }
                    setMostrarSegundoContacto(!mostrarSegundoContacto);
                  }}
                >
                  {mostrarSegundoContacto ? '− Quitar segundo contacto' : '+ Agregar segundo contacto de emergencia'}
                </button>
              </div>
              {mostrarSegundoContacto && (
                <div id="segundo-contacto" className="inscripcion-contacto-campos">
                  <p style={{ gridColumn: '1 / -1' }}>El segundo contacto es opcional. Si lo completás, ingresá nombre y teléfono.</p>
                  <div className="form-group">
                    <label htmlFor="segundoContactoNombre">Nombre del segundo contacto</label>
                    <input id="segundoContactoNombre" name="segundoContactoNombre" type="text" maxLength={100}
                      value={formData.segundoContactoNombre} onChange={handleChange} placeholder="Ej. Juan Gómez" {...propsError('segundoContactoNombre')} />
                {errorCampo('segundoContactoNombre')}
                  </div>
                  <div className="form-group">
                    <label htmlFor="segundoContactoTelefono">Teléfono del segundo contacto</label>
                    <input id="segundoContactoTelefono" name="segundoContactoTelefono" type="tel" maxLength={30}
                      value={formData.segundoContactoTelefono} onChange={handleChange} placeholder="Ej. 3511234567" {...propsError('segundoContactoTelefono')} />
                {errorCampo('segundoContactoTelefono')}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label htmlFor="estudianteExistente">Alumno registrado *</label>
              <select {...propsError('estudianteExistente')}
                id="estudianteExistente"
                value={estudianteSeleccionadoId}
                onChange={(e) => { setEstudianteSeleccionadoId(e.target.value); setErrores((actual) => ({ ...actual, estudianteExistente: '' })); }}
                style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px' }}
              >
                <option value="">Seleccionar alumno</option>
                {estudiantes.map((estudiante) => (
                  <option key={estudiante.id} value={estudiante.id}>
                    {estudiante.firstName} {estudiante.lastName} — DNI {estudiante.dni}
                  </option>
                ))}
              </select>
              {errorCampo('estudianteExistente')}
            </div>
          )}

          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label htmlFor="actividadId" style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', fontWeight: '600', color: '#475569' }}>ACTIVIDAD *</label>
            <select {...propsError('actividadId')}
              id="actividadId"
              name="actividadId"
              value={formData.actividadId}
              onChange={handleChange}
              style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px' }}
            >
              <option value="">Seleccionar actividad</option>
              {actividades.map((actividad) => (
                <option key={actividad.id} value={actividad.id}>
                  {actividad.name}
                </option>
              ))}
            </select>
              {errorCampo('actividadId')}
            {errorActividades && <p role="alert" style={{ color: '#ef4444', fontSize: '0.85rem', marginTop: '0.3rem' }}>{errorActividades}</p>}
          </div>
        </form>

        {/* Botones de acción limpios y únicos */}
        <div className="form-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
          <button onClick={handleClear} type="button" className="btn-secondary">
            Limpiar Formulario
          </button>
          <button onClick={handleSubmit} type="button" className="btn-primary" disabled={guardando}>
            {guardando
              ? 'Guardando...'
              : modoInscripcion === 'nuevo'
                ? 'Registrar e Inscribir Alumno'
                : 'Inscribir Alumno'}
          </button>
        </div>
      </div>

      {/* Sección de la Tabla */}
      <div className="inscripcion-card" style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05)', marginTop: '2rem' }}>
        <h2 style={{ fontSize: '1.2rem', color: '#1e293b', marginBottom: '1.5rem' }}>Últimos Alumnos Inscriptos Recientemente</h2>
        {errorInscripciones && <p role="alert" style={{ color: '#ef4444', marginBottom: '1rem' }}>{errorInscripciones}</p>}
        <div className="table-wrapper">
          <table className="custom-table" style={{ width: '100%', borderCollapse: 'collapse', background: '#fff' }}>
            <thead>
              <tr style={{ background: '#f8fafc', textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>
                <th style={{ padding: '0.9rem 1.2rem', color: '#475569', fontSize: '0.85rem', fontWeight: '600' }}>Nombre y Apellido</th>
                <th style={{ padding: '0.9rem 1.2rem', color: '#475569', fontSize: '0.85rem', fontWeight: '600' }}>DNI</th>
                <th style={{ padding: '0.9rem 1.2rem', color: '#475569', fontSize: '0.85rem', fontWeight: '600' }}>Actividad</th>
                <th style={{ padding: '0.9rem 1.2rem', color: '#475569', fontSize: '0.85rem', fontWeight: '600' }}>Fecha de Inscripción</th>
              </tr>
            </thead>
            <tbody>
              {alumnos.length === 0 ? (
                <tr>
                  <td colSpan="4" style={{ padding: '1.5rem', textAlign: 'center', color: '#64748b', fontStyle: 'italic' }}>
                    No hay inscripciones registradas.
                  </td>
                </tr>
              ) : (
                alumnos.map((alumno) => (
                  <tr key={alumno.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '1rem 1.2rem', fontWeight: 500, color: '#111827' }}>{alumno.nombre}</td>
                    <td style={{ padding: '1rem 1.2rem', color: '#64748b' }}>{alumno.dni}</td>
                    <td style={{ padding: '1rem 1.2rem', color: '#475569' }}>{alumno.actividad}</td>
                    <td style={{ padding: '1rem 1.2rem', color: '#6b7280' }}>{alumno.fecha}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
