import React, { useState, useEffect } from 'react';
import '../styles/inscripcion.css';

export default function InscripcionAlumnos() {
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    dni: '',
    fechaNacimiento: '',
    contactoTutor: '',
    actividadId: ''
  });

  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);

  const [alumnos, setAlumnos] = useState([
    { nombre: 'Alan Gómez', dni: '45.123.882', actividad: 'Fútbol Infantil', fecha: 'Hoy, 10:24' },
    { nombre: 'Sofía Martínez', dni: '44.912.443', actividad: 'Ajedrez Inicial', fecha: 'Ayer, 16:15' },
    { nombre: 'Bruno López', dni: '45.981.012', actividad: 'Fútbol Infantil', fecha: 'Ayer, 14:00' }
  ]);

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    try {
      // Usamos la ruta exacta basada en tu ActivityController.cs
      const response = await fetch('http://localhost:5218/api/Activity');
      if (response.ok) {
        const data = await response.json();
        const list = Array.isArray(data) ? data : data.items || [];
        if (list.length > 0) {
          setActivities(list);
          setFormData(prev => ({ ...prev, actividadId: list[0].id || list[0].activityId }));
          return;
        }
      }
    } catch (error) {
      console.warn('No se pudo conectar con la API de actividades:', error);
    }

    // Opciones de respaldo por si acaso
    const fallbackActivities = [
      { id: 1, name: 'Fútbol Infantil (Lunes y Miércoles)' },
      { id: 2, name: 'Ajedrez Inicial' },
      { id: 3, name: 'Básquet Juvenil' }
    ];
    setActivities(fallbackActivities);
    setFormData(prev => ({ ...prev, actividadId: fallbackActivities[0].id }));
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nombre || !formData.apellido || !formData.dni || !formData.actividadId) {
      alert('Por favor complete los campos obligatorios y seleccione una actividad.');
      return;
    }

    setLoading(true);

    const alumnoData = {
      firstName: formData.nombre,
      lastName: formData.apellido,
      dni: formData.dni,
      birthDate: formData.fechaNacimiento ? new Date(formData.fechaNacimiento).toISOString() : null,
      emergencyContact: formData.contactoTutor,
      activityId: parseInt(formData.actividadId)
    };

    const token = localStorage.getItem('token');

    try {
      // Usamos la ruta exacta basada en tu InscriptionsController.cs
      const response = await fetch('http://localhost:5218/api/Inscriptions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify(alumnoData),
      });

      if (response.ok) {
        alert('¡Alumno inscripto con éxito en la base de datos!');
        
        const selectedAct = activities.find(a => (a.id || a.activityId) == formData.actividadId);
        const actividadNombre = selectedAct ? (selectedAct.name || selectedAct.title) : 'Actividad Deportiva';

        const nuevoAlumno = {
          nombre: `${formData.nombre} ${formData.apellido}`,
          dni: formData.dni,
          actividad: actividadNombre,
          fecha: 'Hoy, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        
        setAlumnos([nuevoAlumno, ...alumnos]);
        handleClear();
      } else {
        const textError = await response.text();
        let errorMsg = 'Hubo un error al registrar el alumno en el servidor.';
        try {
          const jsonError = JSON.parse(textError);
          errorMsg = jsonError.message || errorMsg;
        } catch {
          if (textError) errorMsg = textError;
        }
        alert(errorMsg);
      }
    } catch (error) {
      console.error('Error de red al conectar con la API:', error);
      alert('No se pudo conectar con el backend. Asegúrate de que la API esté corriendo.');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setFormData({
      nombre: '',
      apellido: '',
      dni: '',
      fechaNacimiento: '',
      contactoTutor: '',
      actividadId: activities.length > 0 ? (activities[0].id || activities[0].activityId) : ''
    });
  };

  return (
    <div className="inscripcion-container" style={{ padding: '2.5rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div className="inscripcion-header">
        <h1 style={{ color: '#881337', fontSize: '1.8rem', fontWeight: 'bold', marginBottom: '0.3rem' }}>
          Inscripción de Alumnos Nuevos
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.95rem', marginBottom: '2rem' }}>
          Complete el formulario para incorporar un participante a una actividad deportiva.
        </p>
      </div>

      <div className="inscripcion-card" style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05)', padding: '2.5rem', marginBottom: '3rem' }}>
        <h2 style={{ fontSize: '1.2rem', color: '#1e293b', marginBottom: '1.5rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.8rem' }}>
          Datos Generales del Alumno
        </h2>
        
        <form onSubmit={handleSubmit} className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          <div className="form-group">
            <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', fontWeight: '600', color: '#475569' }}>NOMBRE</label>
            <input
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              placeholder="ej. Alan"
              required
              style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem' }}
            />
          </div>
          <div className="form-group">
            <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', fontWeight: '600', color: '#475569' }}>APELLIDO</label>
            <input
              type="text"
              name="apellido"
              value={formData.apellido}
              onChange={handleChange}
              placeholder="ej. Gómez"
              required
              style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem' }}
            />
          </div>
          <div className="form-group">
            <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', fontWeight: '600', color: '#475569' }}>DNI / DOCUMENTO</label>
            <input
              type="text"
              name="dni"
              value={formData.dni}
              onChange={handleChange}
              placeholder="ej. 45.123.882"
              required
              style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem' }}
            />
          </div>
          <div className="form-group">
            <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', fontWeight: '600', color: '#475569' }}>FECHA DE NACIMIENTO</label>
            <input
              type="date"
              name="fechaNacimiento"
              value={formData.fechaNacimiento}
              onChange={handleChange}
              style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem' }}
            />
          </div>
          <div className="form-group">
            <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', fontWeight: '600', color: '#475569' }}>CONTACTO DE TUTOR (MADRE/PADRE)</label>
            <input
              type="text"
              name="contactoTutor"
              value={formData.contactoTutor}
              onChange={handleChange}
              placeholder="ej. María Gómez (153-998811)"
              style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem' }}
            />
          </div>
          <div className="form-group">
            <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', fontWeight: '600', color: '#475569' }}>ACTIVIDAD DEPORTIVA</label>
            <select
              name="actividadId"
              value={formData.actividadId}
              onChange={handleChange}
              required
              style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem', background: '#fff' }}
            >
              <option value="">Seleccione una actividad...</option>
              {activities.map((act) => (
                <option key={act.id || act.activityId} value={act.id || act.activityId}>
                  {act.name || act.title}
                </option>
              ))}
            </select>
          </div>
        </form>

        <div className="form-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
          <button onClick={handleClear} type="button" style={{ background: 'transparent', border: '1px solid #cbd5e1', color: '#475569', padding: '0.8rem 1.5rem', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>
            Limpiar Formulario
          </button>
          <button onClick={handleSubmit} type="button" disabled={loading} style={{ background: '#881337', color: '#fff', border: 'none', padding: '0.8rem 2rem', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>
            {loading ? 'Registrando...' : 'Registrar e Inscribir Alumno'}
          </button>
        </div>
      </div>

      <div className="inscripcion-card" style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05)', padding: '2.5rem' }}>
        <h2 style={{ fontSize: '1.2rem', color: '#1e293b', marginBottom: '1.5rem' }}>Últimos Alumnos Inscriptos Recientemente</h2>
        
        <div className="table-wrapper" style={{ border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
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
              {alumnos.map((alumno, index) => (
                <tr key={index} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '1rem 1.2rem', fontWeight: 500, color: '#111827' }}>{alumno.nombre}</td>
                  <td style={{ padding: '1rem 1.2rem', color: '#64748b' }}>{alumno.dni}</td>
                  <td style={{ padding: '1rem 1.2rem', color: '#475569' }}>{alumno.actividad}</td>
                  <td style={{ padding: '1rem 1.2rem', color: '#6b7280' }}>{alumno.fecha}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}