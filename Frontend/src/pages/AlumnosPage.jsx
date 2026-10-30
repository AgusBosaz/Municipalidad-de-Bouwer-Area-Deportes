import { useEffect, useState } from 'react'
import { apiRequest } from '../services/api'
import { getStudents } from '../services/studentService'
import { getSession } from '../services/AuthSession'
import '../styles/alumnos.css'

const emptyRecord = { diseases: '', cus: '', observations: '' }

function StudentDetails({ student, onBack, canManage }) {
  const [tab, setTab] = useState('medical')
  const [record, setRecord] = useState(emptyRecord)
  const [recordReady, setRecordReady] = useState(false)
  const [documents, setDocuments] = useState(null)
  const [documentType, setDocumentType] = useState('')
  const [fileUrl, setFileUrl] = useState('')
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)
  const base = `/students/${student.id}`

  useEffect(() => {
    let active = true
    apiRequest(`${base}/medical-record`)
      .then((data) => {
        if (!active) return
        setRecord({
          diseases: data.diseases ?? '',
          cus: data.cus ?? '',
          observations: data.observations ?? '',
        })
        setRecordReady(true)
      })
      .catch((error) => {
        if (!active) return
        if (error.status === 404) setRecordReady(true)
        else setMessage('No se pudo cargar la ficha médica. Volvé a seleccionar el alumno para reintentar.')
      })
    if (canManage) {
      apiRequest(`${base}/documents`)
        .then((data) => { if (active) setDocuments(data) })
        .catch(() => {
          if (active) setMessage('No se pudieron cargar los documentos. Volvé a seleccionar el alumno para reintentar.')
        })
    }
    return () => { active = false }
  }, [base, canManage])

  async function saveRecord(event) {
    event.preventDefault()
    if (!recordReady || busy) return
    setBusy(true)
    setMessage('')
    try {
      await apiRequest(`${base}/medical-record`, {
        method: 'PUT',
        body: JSON.stringify(record),
      })
      setMessage('Ficha médica guardada correctamente.')
    } catch {
      setMessage('No se pudo guardar la ficha médica.')
    } finally {
      setBusy(false)
    }
  }

  async function addDocument(event) {
    event.preventDefault()
    if (busy || !documentType.trim() || !fileUrl.trim()) return
    let url
    try {
      url = new URL(fileUrl.trim())
      if (!['http:', 'https:'].includes(url.protocol)) throw new Error()
    } catch {
      setMessage('Ingresá un enlace que comience con http:// o https://.')
      return
    }
    setBusy(true)
    setMessage('')
    try {
      const result = await apiRequest(`${base}/documents`, {
        method: 'POST',
        body: JSON.stringify({ type: documentType.trim(), fileUrl: url.href }),
      })
      setDocuments((current) => [...current, result.data])
      setDocumentType('')
      setFileUrl('')
      setMessage('Documento registrado correctamente.')
    } catch {
      setMessage('No se pudo registrar el documento.')
    } finally {
      setBusy(false)
    }
  }

  async function deleteDocument(id) {
    if (busy || !window.confirm('¿Querés dar de baja este documento?')) return
    setBusy(true)
    setMessage('')
    try {
      await apiRequest(`${base}/documents/${id}`, { method: 'DELETE' })
      setDocuments((current) => current.filter((document) => document.id !== id))
      setMessage('Documento dado de baja.')
    } catch {
      setMessage('No se pudo dar de baja el documento.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="alumnos-card">
      <button type="button" className="alumnos-secondary" onClick={onBack}>← Volver al listado</button>
      <h2>{student.lastName}, {student.firstName}</h2>
      <p>DNI: {student.dni}</p>
      <div className="alumnos-tabs">
        <button
          type="button"
          aria-pressed={tab === 'medical'}
          onClick={() => { setTab('medical'); setMessage('') }}
        >
          Ficha médica
        </button>

        {canManage && (
          <button
            type="button"
            aria-pressed={tab === 'documents'}
            onClick={() => { setTab('documents'); setMessage('') }}
          >
            Documentación
          </button>
        )}
      </div>
      {message && <p role="status" className="alumnos-message">{message}</p>}
      {tab === 'medical' ? (
        <form className="alumnos-form" onSubmit={saveRecord}>
          <label>Enfermedades o condiciones
            <textarea
              value={record.diseases}
              onChange={(e) => setRecord({ ...record, diseases: e.target.value })}
              disabled={!recordReady || busy}
              readOnly={!canManage}
            />
          </label>
          <label>CUS
            <input
              value={record.cus}
              onChange={(e) => setRecord({ ...record, cus: e.target.value })}
              disabled={!recordReady || busy}
              readOnly={!canManage}
            />
          </label>
          <label>Observaciones
            <textarea
              value={record.observations}
              onChange={(e) => setRecord({ ...record, observations: e.target.value })}
              disabled={!recordReady || busy}
              readOnly={!canManage}
            />
          </label>
          {canManage && (
            <button
              type="submit"
              className="alumnos-primary"
              disabled={!recordReady || busy}
            >
              Guardar ficha médica
            </button>
          )}
        </form>
      ) : (
        <>
          <p>Registrá el tipo de documento y un enlace donde ya esté disponible.</p>
          <form className="alumnos-form" onSubmit={addDocument}>
            <label>Tipo de documento
              <input required value={documentType} onChange={(e) => setDocumentType(e.target.value)} placeholder="Ej. Apto físico" />
            </label>
            <label>Enlace del documento
              <input required type="url" value={fileUrl} onChange={(e) => setFileUrl(e.target.value)} placeholder="https://..." />
            </label>
            <button type="submit" className="alumnos-primary" disabled={documents === null || busy}>Registrar documento</button>
          </form>
          <h3>Documentos registrados</h3>
          {documents === null ? <p>Los documentos no están disponibles.</p> : documents.length === 0 ? (
            <p>No hay documentos registrados para este alumno.</p>
          ) : (
            <ul className="alumnos-documents">
              {documents.map((document) => (
                <li key={document.id}>
                  <span>{document.type}</span>
                  <span>{document.fileUrl && /^https?:\/\//i.test(document.fileUrl)
                    ? <a href={document.fileUrl} target="_blank" rel="noopener noreferrer">Abrir enlace</a>
                    : 'Enlace no disponible'}</span>
                  <button type="button" className="alumnos-secondary" disabled={busy} onClick={() => deleteDocument(document.id)}>Dar de baja</button>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </section>
  )
}

export default function AlumnosPage() {
  const canManage = getSession()?.role === 'Coordinator'
  const [students, setStudents] = useState([])
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    getStudents()
      .then((data) => { if (active) setStudents(data) })
      .catch(() => { if (active) setError('No se pudieron cargar los alumnos.') })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])

  const query = search.trim().toLowerCase()
  const filtered = students.filter((student) =>
    `${student.firstName} ${student.lastName} ${student.dni}`.toLowerCase().includes(query)
  )

  return (
    <div className="alumnos-page">
      {selected ? <StudentDetails key={selected.id} student={selected} onBack={() => setSelected(null)} canManage={canManage} /> : (
        <>
          <h1>Alumnos y fichas médicas</h1>
          <p>Seleccioná un alumno para consultar su ficha y documentación.</p>
          <label className="alumnos-search">Buscar alumno
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Nombre, apellido o DNI" />
          </label>
          {loading ? <p>Cargando alumnos...</p> : error ? <p role="alert">{error}</p> : filtered.length === 0 ? (
            <p>No se encontraron alumnos.</p>
          ) : (
            <ul className="alumnos-list">
              {filtered.map((student) => (
                <li key={student.id}>
                  <div><strong>{student.lastName}, {student.firstName}</strong><p>DNI: {student.dni}</p></div>
                  <button type="button" className="alumnos-primary" onClick={() => setSelected(student)}>Ver ficha y legajo</button>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  )
}
