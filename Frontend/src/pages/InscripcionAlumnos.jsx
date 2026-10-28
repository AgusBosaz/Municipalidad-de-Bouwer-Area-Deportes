import React, { useEffect, useState } from 'react';
import { getActivities } from '../services/activityService';
import { createStudent, getStudents } from '../services/studentService';
import { registerStudent, getInscriptions } from '../services/inscriptionService';
import '../styles/inscripcion.css';

export default function InscripcionAlumnos() {

  const [actividades, setActividades] = useState([]);
  const [errorActividades, setErrorActividades] = useState('');
  const [guardando, setGuardando] = useState(false);

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

    Promise.all([getInscriptions(), getStudents()])
      .then(([inscripciones, estudiantes]) => {
        if (!active) return;
        setErrorInscripciones('');

        setEstudiantes(estudiantes);

        const estudiantePorId = new Map(
          estudiantes.map((estudiante) => [estudiante.id, estudiante])
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
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

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
    };

    const datosNuevoIncompletos =
      !alumnoData.firstName ||
      !alumnoData.lastName ||
      !alumnoData.dni ||
      !alumnoData.birthDate ||
      !alumnoData.emergencyContactName ||
      !alumnoData.emergencyContactPhoneNumber;

    if (
      !actividadId ||
      (modoInscripcion === 'nuevo' && datosNuevoIncompletos) ||
      (modoInscripcion === 'existente' && !estudianteSeleccionadoId)
    ) {
      alert('Completá los datos necesarios y seleccioná una actividad.');
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

      alert(modoInscripcion === 'nuevo'
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
        alert(
          `El alumno se creó con ID ${alumnoCreado.id}, pero no se pudo inscribir.\n` +
          (mensajeApi ? `Motivo: ${mensajeApi}\n` : '') +
          'No repitas el alta: seleccioná “Alumno existente” para completar la inscripción.'
        );
      } else if (modoInscripcion === 'nuevo' && error.status === 409) {
        alert('Ya existe un usuario con ese DNI. Buscalo en “Alumno existente”.');
      } else {
        alert(mensajeApi || (
          modoInscripcion === 'existente'
            ? 'No se pudo inscribir al alumno en la actividad.'
            : 'No se pudo crear el alumno. Intentá nuevamente.'
        ));
      }
    } finally {
      setGuardando(false);
    }
  }

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
      actividadId: ''
    });
    setEstudianteSeleccionadoId('');
  };

  return (
    <div className="inscripcion-container">
      {/* Encabezado */}
      <div className="inscripcion-header">
        <h1>Inscripción de Alumnos</h1>
        <p>Complete el formulario para incorporar un participante a una actividad deportiva.</p>
      </div>

      {/* Tarjeta del Formulario */}
      <div className="inscripcion-card">
        <h2>
          {modoInscripcion === 'nuevo'
            ? 'Datos generales del alumno'
            : 'Inscribir alumno registrado'}
        </h2>

        <div className="form-actions" role="group" aria-label="Tipo de inscripción">
          <button
            type="button"
            className={modoInscripcion === 'nuevo' ? 'btn-primary' : 'btn-secondary'}
            aria-pressed={modoInscripcion === 'nuevo'}
            onClick={() => setModoInscripcion('nuevo')}
          >
            Alumno nuevo
          </button>

          <button
            type="button"
            className={modoInscripcion === 'existente' ? 'btn-primary' : 'btn-secondary'}
            aria-pressed={modoInscripcion === 'existente'}
            onClick={() => setModoInscripcion('existente')}
          >
            Alumno existente
          </button>
        </div>

        <form onSubmit={handleSubmit} className="form-grid">
          {modoInscripcion === 'nuevo' ? (
            <>
              <div className="form-group">
                <label>Nombre</label>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  placeholder="ej. Alan"
                />
              </div>
              <div className="form-group">
                <label>Apellido</label>
                <input
                  type="text"
                  name="apellido"
                  value={formData.apellido}
                  onChange={handleChange}
                  placeholder="ej. Gómez"
                />
              </div>
              <div className="form-group">
                <label>DNI / Documento</label>
                <input
                  type="text"
                  name="dni"
                  value={formData.dni}
                  onChange={handleChange}
                  placeholder="ej. 45.123.882"
                />
              </div>
              <div className="form-group">
                <label>Fecha de Nacimiento</label>
                <input
                  type="date"
                  name="fechaNacimiento"
                  value={formData.fechaNacimiento}
                  onChange={handleChange}
                  placeholder="AAAA/MM/DD"
                />
              </div>
              <div className="form-group">
                <label htmlFor="genero">Género</label>
                <select
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
              </div>

              <div className="form-group">
                <label htmlFor="telefono">Teléfono del alumno</label>
                <input
                  id="telefono"
                  type="tel"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleChange}
                  placeholder="ej. 3511234567"
                />
              </div>

              <div className="form-group">
                <label htmlFor="direccion">Dirección</label>
                <input
                  id="direccion"
                  type="text"
                  name="direccion"
                  value={formData.direccion}
                  onChange={handleChange}
                  placeholder="ej. San Martín 123"
                />
              </div>
              <div className="form-group">
                <label htmlFor="contactoEmergenciaNombre">Nombre del contacto de emergencia</label>
                <input
                  id="contactoEmergenciaNombre"
                  type="text"
                  name="contactoEmergenciaNombre"
                  value={formData.contactoEmergenciaNombre}
                  onChange={handleChange}
                  placeholder="ej. María Gómez"
                />
              </div>

              <div className="form-group">
                <label htmlFor="contactoEmergenciaTelefono">Teléfono del contacto de emergencia</label>
                <input
                  id="contactoEmergenciaTelefono"
                  type="tel"
                  name="contactoEmergenciaTelefono"
                  value={formData.contactoEmergenciaTelefono}
                  onChange={handleChange}
                  placeholder="ej. 153998811"
                />
              </div>
            </>
          ) : (
            <div className="form-group">
              <label htmlFor="estudianteExistente">Alumno registrado</label>
              <select
                id="estudianteExistente"
                value={estudianteSeleccionadoId}
                onChange={(e) => setEstudianteSeleccionadoId(e.target.value)}
              >
                <option value="">Seleccionar alumno</option>
                {estudiantes.map((estudiante) => (
                  <option key={estudiante.id} value={estudiante.id}>
                    {estudiante.firstName} {estudiante.lastName} — DNI {estudiante.dni}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div className="form-group">
            <label>Actividad Deportiva</label>
            <select
              name="actividadId"
              value={formData.actividadId}
              onChange={handleChange}
              required
            >
              <option value="">Seleccionar actividad</option>
              {actividades.map((actividad) => (
                <option key={actividad.id} value={actividad.id}>
                  {actividad.name}
                </option>
              ))}
            </select>
            {errorActividades && <p role="alert">{errorActividades}</p>}
          </div>
        </form>

        <div className="form-actions">
          <button onClick={handleSubmit} type="button" className="btn-primary" disabled={guardando}>
            {guardando
              ? 'Guardando...'
              : modoInscripcion === 'nuevo'
                ? 'Registrar e Inscribir Alumno'
                : 'Inscribir Alumno'}
          </button>
          <button onClick={handleClear} type="button" className="btn-secondary">
            Limpiar Formulario
          </button>
        </div>
      </div>

      {/* Sección de la Tabla */}
      <div className="inscripcion-card">
        <h2>Últimos Alumnos Inscriptos Recientemente</h2>
        {errorInscripciones && <p role="alert">{errorInscripciones}</p>}
        <div className="table-wrapper">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Nombre y Apellido</th>
                <th>DNI</th>
                <th>Actividad</th>
                <th>Fecha de Inscripción</th>
              </tr>
            </thead>
            <tbody>
              {alumnos.map((alumno) => (
                <tr key={alumno.id}>
                  <td style={{ fontWeight: 500, color: '#111827' }}>{alumno.nombre}</td>
                  <td>{alumno.dni}</td>
                  <td>{alumno.actividad}</td>
                  <td style={{ color: '#6b7280' }}>{alumno.fecha}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}