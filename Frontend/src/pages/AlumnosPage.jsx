import { useState, useEffect } from 'react'
import { FileText, Stethoscope, Search, Plus, Trash2, CheckCircle2, AlertCircle, User, ShieldAlert, ArrowLeft } from 'lucide-react'
import '../styles/layout.css'

function AlumnosPage() {
  const [students, setStudents] = useState([])
  const [filteredStudents, setFilteredStudents] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStudent, setSelectedStudent] = useState(null)
  
  // Pestaña activa dentro del detalle: 'medical' o 'documents'
  const [activeTab, setActiveTab] = useState('medical')

  // Estados de Documentación General
  const [documents, setDocuments] = useState([])
  const [docName, setDocName] = useState('')
  const [docDescription, setDocDescription] = useState('')

  // Estados de Ficha Médica
  const [medicalForm, setMedicalForm] = useState({
    bloodType: '',
    allergies: '',
    medicalConditions: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    observations: ''
  })

  const [message, setMessage] = useState({ type: '', text: '' })
  const [loading, setLoading] = useState(true)

  // Cargar todos los alumnos al iniciar la página
  useEffect(() => {
    fetchAllStudents()
  }, [])

  const fetchAllStudents = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/students')
      if (res.ok) {
        const data = await res.json()
        const list = Array.isArray(data) ? data : data.items || []
        setStudents(list)
        setFilteredStudents(list)
      }
    } catch (err) {
      console.error('Error al cargar alumnos:', err)
    } finally {
      setLoading(false)
    }
  }

  // Filtrar alumnos en tiempo real
  const handleSearchChange = (e) => {
    const query = e.target.value
    setSearchQuery(query)
    if (!query.trim()) {
      setFilteredStudents(students)
    } else {
      const lower = query.toLowerCase()
      setFilteredStudents(
        students.filter(
          (st) =>
            st.lastName?.toLowerCase().includes(lower) ||
            st.firstName?.toLowerCase().includes(lower) ||
            st.dni?.includes(query)
        )
      )
    }
  }

  // Seleccionar alumno y cargar sus datos asociados
  const handleSelectStudent = async (student) => {
    setSelectedStudent(student)
    setMessage({ type: '', text: '' })
    const studentId = student.id || student.studentId
    await fetchStudentDocuments(studentId)
    await fetchMedicalRecord(studentId)
  }

  const fetchStudentDocuments = async (studentId) => {
    try {
      const res = await fetch(`/api/students/${studentId}/documents`)
      if (res.ok) {
        const data = await res.json()
        setDocuments(data)
      }
    } catch (err) {
      console.error(err)
    }
  }

  const fetchMedicalRecord = async (studentId) => {
    try {
      const res = await fetch(`/api/students/${studentId}/medical-record`)
      if (res.ok) {
        const data = await res.json()
        setMedicalForm({
          bloodType: data.bloodType || '',
          allergies: data.allergies || '',
          medicalConditions: data.medicalConditions || '',
          emergencyContactName: data.emergencyContactName || '',
          emergencyContactPhone: data.emergencyContactPhone || '',
          observations: data.observations || ''
        })
      } else {
        setMedicalForm({
          bloodType: '',
          allergies: '',
          medicalConditions: '',
          emergencyContactName: '',
          emergencyContactPhone: '',
          observations: ''
        })
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleAddDocument = async (e) => {
    e.preventDefault()
    if (!docName.trim() || !selectedStudent) return

    const studentId = selectedStudent.id || selectedStudent.studentId
    try {
      const res = await fetch(`/api/students/${studentId}/documents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: docName, description: docDescription })
      })

      if (res.ok) {
        setMessage({ type: 'success', text: 'Documento registrado con éxito.' })
        setDocName('')
        setDocDescription('')
        await fetchStudentDocuments(studentId)
      } else {
        const errData = await res.json()
        setMessage({ type: 'error', text: errData.message || 'Error al registrar documento.' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error de conexión.' })
    }
  }

  const handleDeleteDocument = async (docId) => {
    const studentId = selectedStudent.id || selectedStudent.studentId
    try {
      const res = await fetch(`/api/students/${studentId}/documents/${docId}`, {
        method: 'DELETE'
      })
      if (res.ok) {
        setMessage({ type: 'success', text: 'Documento eliminado.' })
        await fetchStudentDocuments(studentId)
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'No se pudo eliminar el documento.' })
    }
  }

  const handleSaveMedicalRecord = async (e) => {
    e.preventDefault()
    if (!selectedStudent) return

    const studentId = selectedStudent.id || selectedStudent.studentId
    try {
      const res = await fetch(`/api/students/${studentId}/medical-record`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(medicalForm)
      })

      if (res.ok) {
        setMessage({ type: 'success', text: 'Ficha médica guardada con éxito.' })
        await fetchMedicalRecord(studentId)
      } else {
        const errData = await res.json()
        setMessage({ type: 'error', text: errData.message || 'Error al guardar ficha médica.' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error de conexión.' })
    }
  }

  return (
    <div style={{ padding: '2.5rem', maxWidth: '1200px', margin: '0 auto', fontFamily: 'Inter, system-ui, sans-serif' }}>
      
      {!selectedStudent ? (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div>
              <h2 style={{ color: '#881337', fontSize: '1.8rem', fontWeight: 'bold', marginBottom: '0.3rem' }}>
                Gestión de Alumnos y Fichas Médicas
              </h2>
              <p style={{ color: '#64748b', fontSize: '0.95rem' }}>
                Seleccione un alumno del listado para consultar o registrar su ficha médica y documentación.
              </p>
            </div>
          </div>

          <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '9999px', padding: '0.6rem 1.2rem', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
              <Search size={20} style={{ color: '#94a3b8', marginRight: '0.8rem' }} />
              <input
                type="text"
                placeholder="Filtrar por DNI o Apellido del alumno..."
                value={searchQuery}
                onChange={handleSearchChange}
                style={{ border: 'none', outline: 'none', width: '100%', fontSize: '1rem', background: 'transparent' }}
              />
            </div>
          </div>

          {loading ? (
            <p style={{ textAlign: 'center', color: '#64748b', padding: '2rem' }}>Cargando alumnos...</p>
          ) : filteredStudents.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#64748b', padding: '2rem' }}>No se encontraron alumnos registrados.</p>
          ) : (
            <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>
                    <th style={{ padding: '1rem 1.2rem', color: '#475569', fontSize: '0.85rem', fontWeight: '600' }}>ALUMNO</th>
                    <th style={{ padding: '1rem 1.2rem', color: '#475569', fontSize: '0.85rem', fontWeight: '600' }}>DNI</th>
                    <th style={{ padding: '1rem 1.2rem', color: '#475569', fontSize: '0.85rem', fontWeight: '600' }}>EMAIL / TELÉFONO</th>
                    <th style={{ padding: '1rem 1.2rem', color: '#475569', fontSize: '0.85rem', fontWeight: '600', textAlign: 'right' }}>ACCIONES</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((st) => (
                    <tr key={st.id || st.studentId} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.2s' }}>
                      <td style={{ padding: '1rem 1.2rem', fontWeight: '600', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                        <div style={{ background: '#f1f5f9', padding: '0.5rem', borderRadius: '50%', color: '#881337' }}>
                          <User size={16} />
                        </div>
                        {st.lastName}, {st.firstName}
                      </td>
                      <td style={{ padding: '1rem 1.2rem', color: '#475569' }}>{st.dni}</td>
                      <td style={{ padding: '1rem 1.2rem', color: '#64748b' }}>{st.email || st.phoneNumber || '-'}</td>
                      <td style={{ padding: '1rem 1.2rem', textAlign: 'right' }}>
                        <button
                          onClick={() => handleSelectStudent(st)}
                          style={{ background: '#881337', color: '#fff', border: 'none', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', fontWeight: '500', fontSize: '0.85rem' }}
                        >
                          Ver Ficha y Legajo
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      ) : (

        <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05)', overflow: 'hidden' }}>
          
          <div style={{ background: '#f8fafc', padding: '1.5rem 2rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
              <button
                onClick={() => setSelectedStudent(null)}
                style={{ background: 'transparent', border: '1px solid #cbd5e1', padding: '0.5rem', borderRadius: '8px', color: '#475569', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                title="Volver al listado"
              >
                <ArrowLeft size={20} />
              </button>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.4rem', color: '#1e293b' }}>
                  {selectedStudent.lastName}, {selectedStudent.firstName}
                </h3>
                <span style={{ color: '#64748b', fontSize: '0.9rem' }}>DNI: {selectedStudent.dni}</span>
              </div>
            </div>
          </div>

          {message.text && (
            <div style={{ margin: '1.5rem 2rem 0', padding: '0.9rem 1.2rem', borderRadius: '8px', background: message.type === 'error' ? '#fef2f2' : '#f0fdf4', color: message.type === 'error' ? '#991b1b' : '#166534', display: 'flex', alignItems: 'center', gap: '0.6rem', border: `1px solid ${message.type === 'error' ? '#fca5a5' : '#bbf7d0'}` }}>
              {message.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
              {message.text}
            </div>
          )}

          <div style={{ display: 'flex', gap: '2rem', padding: '0 2rem', borderBottom: '1px solid #e2e8f0', marginTop: '1rem' }}>
            <button
              type="button"
              onClick={() => setActiveTab('medical')}
              style={{ padding: '1rem 0', background: 'none', border: 'none', borderBottom: activeTab === 'medical' ? '3px solid #881337' : '3px solid transparent', color: activeTab === 'medical' ? '#881337' : '#64748b', fontWeight: activeTab === 'medical' ? 'bold' : '500', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem' }}
            >
              <Stethoscope size={18} /> Ficha Médica
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('documents')}
              style={{ padding: '1rem 0', background: 'none', border: 'none', borderBottom: activeTab === 'documents' ? '3px solid #881337' : '3px solid transparent', color: activeTab === 'documents' ? '#881337' : '#64748b', fontWeight: activeTab === 'documents' ? 'bold' : '500', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem' }}
            >
              <FileText size={18} /> Documentación General
            </button>
          </div>

          {activeTab === 'medical' && (
            <div style={{ padding: '2rem' }}>
              <form onSubmit={handleSaveMedicalRecord} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.2rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', fontWeight: '600', color: '#475569' }}>GRUPO SANGUÍNEO</label>
                  <input
                    type="text"
                    value={medicalForm.bloodType}
                    onChange={(e) => setMedicalForm({ ...medicalForm, bloodType: e.target.value })}
                    placeholder="Ej. A Rh Positivo (+)"
                    style={{ width: '100%', padding: '0.7rem 1rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', fontWeight: '600', color: '#475569' }}>ALERGIAS CONOCIDAS</label>
                  <input
                    type="text"
                    value={medicalForm.allergies}
                    onChange={(e) => setMedicalForm({ ...medicalForm, allergies: e.target.value })}
                    placeholder="Ej. Penicilina, Picaduras de Abeja"
                    style={{ width: '100%', padding: '0.7rem 1rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem' }}
                  />
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', fontWeight: '600', color: '#475569' }}>CONDICIONES O ENFERMEDADES CRÓNICAS</label>
                  <textarea
                    value={medicalForm.medicalConditions}
                    onChange={(e) => setMedicalForm({ ...medicalForm, medicalConditions: e.target.value })}
                    rows={2}
                    placeholder="Ej. Asma Leve (Trae aerosol preventivo a clases)"
                    style={{ width: '100%', padding: '0.7rem 1rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', fontWeight: '600', color: '#475569' }}>CONTACTO DE EMERGENCIA (NOMBRE)</label>
                  <input
                    type="text"
                    value={medicalForm.emergencyContactName}
                    onChange={(e) => setMedicalForm({ ...medicalForm, emergencyContactName: e.target.value })}
                    placeholder="Ej. María Luz Gómez (Madre)"
                    style={{ width: '100%', padding: '0.7rem 1rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', fontWeight: '600', color: '#475569' }}>TELÉFONO DE EMERGENCIA</label>
                  <input
                    type="text"
                    value={medicalForm.emergencyContactPhone}
                    onChange={(e) => setMedicalForm({ ...medicalForm, emergencyContactPhone: e.target.value })}
                    placeholder="Ej. 153-998811"
                    style={{ width: '100%', padding: '0.7rem 1rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem' }}
                  />
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', fontWeight: '600', color: '#475569' }}>OBSERVACIONES DE DOCENCIA</label>
                  <textarea
                    value={medicalForm.observations}
                    onChange={(e) => setMedicalForm({ ...medicalForm, observations: e.target.value })}
                    rows={2}
                    placeholder="Ej. Autorizado a retirarse solo de la instalación."
                    style={{ width: '100%', padding: '0.7rem 1rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem' }}
                  />
                </div>
                <div style={{ gridColumn: 'span 2', marginTop: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
                  <button type="submit" style={{ background: '#881337', color: '#fff', border: 'none', padding: '0.8rem 2rem', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '1rem' }}>
                    Guardar Ficha Médica
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'documents' && (
            <div style={{ padding: '2rem' }}>
              <h4 style={{ color: '#1e293b', marginBottom: '1rem', fontSize: '1.1rem' }}>Registrar Nuevo Documento</h4>
              
              <form onSubmit={handleAddDocument} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '1rem', marginBottom: '2rem', background: '#f8fafc', padding: '1.2rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <input
                  type="text"
                  placeholder="Nombre (ej. Fotocopia de DNI, Apto físico)"
                  value={docName}
                  onChange={(e) => setDocName(e.target.value)}
                  required
                  style={{ padding: '0.7rem 1rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem', background: '#fff' }}
                />
                <input
                  type="text"
                  placeholder="Descripción u observaciones opcionales"
                  value={docDescription}
                  onChange={(e) => setDocDescription(e.target.value)}
                  style={{ padding: '0.7rem 1rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem', background: '#fff' }}
                />
                <button type="submit" style={{ background: '#881337', color: '#fff', border: 'none', padding: '0.7rem 1.4rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', fontWeight: '600' }}>
                  <Plus size={18} /> Registrar
                </button>
              </form>

              <h4 style={{ color: '#1e293b', marginBottom: '1rem', fontSize: '1.1rem' }}>Documentos Registrados en el Legajo</h4>
              {documents.length === 0 ? (
                <p style={{ color: '#64748b', fontStyle: 'italic', background: '#f8fafc', padding: '1.5rem', borderRadius: '8px', textAlign: 'center' }}>
                  No hay documentos registrados para este alumno.
                </p>
              ) : (
                <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
                  <table style={{ width: '100%', background: '#fff', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: '#f8fafc', textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>
                        <th style={{ padding: '0.9rem 1.2rem', color: '#475569', fontSize: '0.85rem', fontWeight: '600' }}>DOCUMENTO</th>
                        <th style={{ padding: '0.9rem 1.2rem', color: '#475569', fontSize: '0.85rem', fontWeight: '600' }}>DESCRIPCIÓN</th>
                        <th style={{ padding: '0.9rem 1.2rem', color: '#475569', fontSize: '0.85rem', fontWeight: '600', textAlign: 'right' }}>ACCIONES</th>
                      </tr>
                    </thead>
                    <tbody>
                      {documents.map((doc) => (
                        <tr key={doc.id || doc.documentId} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '1rem 1.2rem', fontWeight: '500', color: '#1e293b' }}>{doc.name}</td>
                          <td style={{ padding: '1rem 1.2rem', color: '#64748b' }}>{doc.description || 'Sin observaciones'}</td>
                          <td style={{ padding: '1rem 1.2rem', textAlign: 'right' }}>
                            <button
                              onClick={() => handleDeleteDocument(doc.id || doc.documentId)}
                              style={{ background: '#fef2f2', border: '1px solid #fca5a5', color: '#991b1b', padding: '0.4rem 0.8rem', borderRadius: '6px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.85rem', fontWeight: '500' }}
                            >
                              <Trash2 size={14} /> Eliminar
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          <div style={{ background: '#f8fafc', padding: '1rem 2rem', borderTop: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#64748b', fontSize: '0.85rem' }}>
            <ShieldAlert size={16} />
            <span>La información registrada se sincroniza de forma segura con el legajo del alumno en el Área de Deportes.</span>
          </div>

        </div>
      )}
    </div>
  )
}

export default AlumnosPage