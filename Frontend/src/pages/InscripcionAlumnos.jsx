import React, { useState } from 'react';
import '../styles/inscripcion.css';

export default function InscripcionAlumnos() {
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    dni: '',
    fechaNacimiento: '',
    contactoTutor: '',
    actividad: 'Fútbol Infantil (Lunes y Miércoles)'
  });

  const [alumnos, setAlumnos] = useState([
    { nombre: 'Alan Gómez', dni: '45.123.882', actividad: 'Fútbol Infantil', fecha: 'Hoy, 10:24' },
    { nombre: 'Sofía Martínez', dni: '44.912.443', actividad: 'Ajedrez Inicial', fecha: 'Ayer, 16:15' },
    { nombre: 'Bruno López', dni: '45.981.012', actividad: 'Fútbol Infantil', fecha: 'Ayer, 14:00' }
  ]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nombre || !formData.apellido || !formData.dni) {
      alert('Por favor complete los campos obligatorios.');
      return;
    }

    const alumnoData = {
      nombre: formData.nombre,
      apellido: formData.apellido,
      dni: formData.dni,
      fechaNacimiento: formData.fechaNacimiento,
      contactoTutor: formData.contactoTutor,
      actividadId: 1
    };

    try {
      const response = await fetch('http://localhost:5000/api/Enrollments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(alumnoData),
      });

      if (response.ok) {
        alert('¡Alumno inscripto con éxito en la base de datos!');
        const nuevoAlumno = {
          nombre: `${formData.nombre} ${formData.apellido}`,
          dni: formData.dni,
          actividad: formData.actividad,
          fecha: 'Hoy, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setAlumnos([nuevoAlumno, ...alumnos]);
        handleClear();
      } else {
        alert('Hubo un error al registrar el alumno en el servidor.');
      }
    } catch (error) {
      console.error('Error de red al conectar con la API:', error);
      alert('No se pudo conectar con el backend. Asegúrate de que la API esté corriendo.');
    }
  };

  const handleClear = () => {
    setFormData({
      nombre: '',
      apellido: '',
      dni: '',
      fechaNacimiento: '',
      contactoTutor: '',
      actividad: 'Fútbol Infantil (Lunes y Miércoles)'
    });
  };

  return (
    <div className="inscripcion-container">
      {/* Encabezado */}
      <div className="inscripcion-header">
        <h1>Inscripción de Alumnos Nuevos</h1>
        <p>Complete el formulario para incorporar un participante a una actividad deportiva.</p>
      </div>

      {/* Tarjeta del Formulario */}
      <div className="inscripcion-card">
        <h2>Datos Generales del Alumno</h2>
        
        <form onSubmit={handleSubmit} className="form-grid">
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
              type="text"
              name="fechaNacimiento"
              value={formData.fechaNacimiento}
              onChange={handleChange}
              placeholder="DD/MM/AAAA"
            />
          </div>
          <div className="form-group">
            <label>Contacto de Tutor (Madre/Padre)</label>
            <input
              type="text"
              name="contactoTutor"
              value={formData.contactoTutor}
              onChange={handleChange}
              placeholder="ej. María Gómez (153-998811)"
            />
          </div>
          <div className="form-group">
            <label>Actividad Deportiva</label>
            <select
              name="actividad"
              value={formData.actividad}
              onChange={handleChange}
            >
              <option>Fútbol Infantil (Lunes y Miércoles)</option>
              <option>Ajedrez Inicial</option>
              <option>Básquet Juvenil</option>
            </select>
          </div>
        </form>

        <div className="form-actions">
          <button onClick={handleSubmit} type="button" className="btn-primary">
            Registrar e Inscribir Alumno
          </button>
          <button onClick={handleClear} type="button" className="btn-secondary">
            Limpiar Formulario
          </button>
        </div>
      </div>

      {/* Sección de la Tabla */}
      <div className="inscripcion-card">
        <h2>Últimos Alumnos Inscriptos Recientemente</h2>
        
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
              {alumnos.map((alumno, index) => (
                <tr key={index}>
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