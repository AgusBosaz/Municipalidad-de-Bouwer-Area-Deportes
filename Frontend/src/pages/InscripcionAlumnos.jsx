import React, { useState, useEffect } from 'react';
import '../styles/inscripcion.css';

export default function InscripcionAlumnos() {
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    dni: '',
    fechaNacimiento: '',
    contactoTutor: '',
    activityId: '1'
  });

  const [alumnos, setAlumnos] = useState([]);
  const [loading, setLoading] = useState(true);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
  };

  useEffect(() => {
    fetchInscripciones();
  }, []);

  const fetchInscripciones = async () => {
    try {
      const response = await fetch('http://localhost:5218/api/Inscriptions', {
        method: 'GET',
        headers: getAuthHeaders()
      });

      if (response.ok) {
        const data = await response.json();
        setAlumnos(data);
      } else {
        console.error('Error al obtener las inscripciones del servidor.');
      }
    } catch (error) {
      console.error('Error de red al conectar con la API:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nombre || !formData.apellido || !formData.dni) {
      alert('Por favor complete los campos obligatorios (Nombre, Apellido y DNI).');
      return;
    }

    const payload = {
      nombre: formData.nombre,
      apellido: formData.apellido,
      dni: formData.dni,
      fechaNacimiento: formData.fechaNacimiento,
      contactoTutor: formData.contactoTutor,
      activityId: parseInt(formData.activityId, 10)
    };

    try {
      const response = await fetch('http://localhost:5218/api/Inscriptions', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });

      const contentType = response.headers.get("content-type");
      let result;
      if (contentType && contentType.includes("application/json")) {
        result = await response.json();
      } else {
        result = { message: await response.text() };
      }

      if (response.ok) {
        alert('¡Alumno registrado e inscripto con éxito en la base de datos!');
        handleClear();
        fetchInscripciones();
      } else {
        alert(`Error: ${result.message || 'No se pudo registrar el alumno.'}`);
      }
    } catch (error) {
      console.error('Error de red al conectar con la API:', error);
      alert('No se pudo conectar con el backend.');
    }
  };

  const handleClear = () => {
    setFormData({
      nombre: '',
      apellido: '',
      dni: '',
      fechaNacimiento: '',
      contactoTutor: '',
      activityId: '1'
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
              placeholder="ej. 45123882"
            />
          </div>
          <div className="form-group">
            <label>Fecha de Nacimiento</label>
            <input
              type="text"
              name="fechaNacimiento"
              value={formData.fechaNacimiento}
              onChange={handleChange}
              placeholder="AAAA-MM-DD"
            />
          </div>
          <div className="form-group">
            <label>Contacto de Tutor (Madre/Padre)</label>
            <input
              type="text"
              name="contactoTutor"
              value={formData.contactoTutor}
              onChange={handleChange}
              placeholder="ej. María Gómez (351-998811)"
            />
          </div>
          <div className="form-group">
            <label>Actividad Deportiva</label>
            <select
              name="activityId"
              value={formData.activityId}
              onChange={handleChange}
            >
              <option value="1">Fútbol Infantil (Lunes y Miércoles)</option>
              <option value="2">Ajedrez Inicial</option>
              <option value="3">Básquet Juvenil</option>
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
                <th>Actividad</th>
                <th>Fecha de Inscripción</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="3" style={{ textAlign: 'center', padding: '1.5rem' }}>Cargando registros...</td>
                </tr>
              ) : alumnos.length === 0 ? (
                <tr>
                  <td colSpan="3" style={{ textAlign: 'center', padding: '1.5rem' }}>No hay inscripciones registradas.</td>
                </tr>
              ) : (
                alumnos.map((item) => (
                  <tr key={item.id}>
                    <td style={{ fontWeight: 500, color: '#111827' }}>
                      {item.studentName}
                    </td>
                    <td>{item.activityName}</td>
                    <td style={{ color: '#6b7280' }}>{item.enrollmentDate}</td>
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