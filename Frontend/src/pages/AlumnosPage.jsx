import { useAvisos } from '../components/AvisosContext'
import { useEffect, useState } from 'react'
import { apiRequest } from '../services/api'
import { getStudents } from '../services/studentService'
import { getSession } from '../services/AuthSession'
import { getMedicalRecordPdf, saveMedicalRecordPdf } from '../services/medicalRecordPdfService'
import '../styles/alumnos.css'

const emptyRecord = { diseases: '', cus: '', observations: '' }

function StudentDetails({ student, onBack, canManage }) {
  const { preguntar } = useAvisos()
  const [tab, setTab] = useState('personal')
  const [record, setRecord] = useState(emptyRecord)
  const [recordReady, setRecordReady] = useState(false)
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)
  const [pdfFile, setPdfFile] = useState(null)
  const [pdfUrl, setPdfUrl] = useState(null)
  const [pdfBusy, setPdfBusy] = useState(false)
  const [pdfMessage, setPdfMessage] = useState('')
  const [pdfInputKey, setPdfInputKey] = useState(0)
  const base = `/students/${student.id}`

  useEffect(() => () => {
    if (pdfUrl) URL.revokeObjectURL(pdfUrl)
  }, [pdfUrl])

  async function viewPdf() {
    setPdfBusy(true)
    setPdfMessage('')
    setPdfUrl(null)
    try {
      const pdf = await getMedicalRecordPdf(student.id)
      setPdfUrl(URL.createObjectURL(pdf))
    } catch (error) {
      setPdfMessage(error.status === 404
        ? 'Este alumno todavía no tiene una ficha médica en PDF.'
        : 'No se pudo cargar el PDF. Intentá nuevamente.')
    } finally {
      setPdfBusy(false)
    }
  }

  function openMedicalTab() {
    setTab('medical')
    setMessage('')
    if (!pdfBusy) viewPdf()
  }

  async function uploadPdf(event) {
    event.preventDefault()
    if (!pdfFile || pdfBusy) return
    if (!pdfFile.name.toLowerCase().endsWith('.pdf') || pdfFile.size > 10 * 1024 * 1024) {
      setPdfMessage('Seleccioná un archivo PDF de hasta 10 MB.')
      return
    }
    if (!await preguntar('Si ya existe una ficha PDF, será reemplazada. ¿Querés continuar?')) return
    setPdfBusy(true)
    setPdfMessage('')
    try {
      await saveMedicalRecordPdf(student.id, pdfFile)
      setPdfUrl(null)
      setPdfFile(null)
      setPdfInputKey((key) => key + 1)
      setPdfMessage('Ficha médica PDF guardada correctamente.')
    } catch (error) {
      setPdfMessage(error.status === 400 || error.status === 413
        ? 'El archivo debe ser un PDF válido de hasta 10 MB.'
        : 'No se pudo guardar la ficha PDF. Intentá nuevamente.')
    } finally {
      setPdfBusy(false)
    }
  }

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
    return () => { active = false }
  }, [base])

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

  return (
    <section className="alumnos-card">
      <button type="button" className="alumnos-secondary alumnos-volver" onClick={onBack}>← Volver al listado</button>
      <h2>{student.lastName}, {student.firstName}</h2>
      <p>DNI: {student.dni}</p>
      <div className="alumnos-tabs">
        <button
          type="button"
          aria-pressed={tab === 'personal'}
          onClick={() => { setTab('personal'); setMessage('') }}
        >
          Datos personales
        </button>

        <button
          type="button"
          aria-pressed={tab === 'medical'}
          onClick={openMedicalTab}
          disabled={pdfBusy}
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
      {tab === 'personal' ? (
        <form className="alumnos-form" onSubmit={saveRecord}>
          <section className="alumnos-contactos" aria-label="Datos de contacto">
            <h3>Datos de contacto</h3>
            <p className="alumnos-telefono"><strong>Teléfono del alumno:</strong> <span>{student.phoneNumber || 'No registrado'}</span></p>
            <div className="alumnos-contactos-lista">
              <div className="alumnos-contacto">
                <p><strong>Contacto de emergencia:</strong> <span>{student.emergencyContactName || 'No registrado'}</span></p>
                <p><strong>Teléfono de emergencia:</strong> <span>{student.emergencyContactPhoneNumber || 'No registrado'}</span></p>
              </div>
              {(student.additionalEmergencyContacts || []).map((contacto, index) => (
                <div className="alumnos-contacto" key={`${contacto.name}-${contacto.phoneNumber}-${index}`}>
                  <p><strong>Contacto adicional:</strong> <span>{contacto.name}</span></p>
                  <p><strong>Teléfono de emergencia:</strong> <span>{contacto.phoneNumber}</span></p>
                </div>
              ))}
            </div>
          </section>
          <label>Enfermedades o condiciones
            <textarea
              placeholder="Ej. Alergia al polen"
              value={record.diseases}
              onChange={(e) => setRecord({ ...record, diseases: e.target.value })}
              disabled={!recordReady || busy}
              readOnly={!canManage}
            />
          </label>
          <label>Observaciones
            <textarea
              placeholder="Ej. Indicación para la actividad"
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
              Guardar datos
            </button>
          )}
        </form>
      ) : tab === 'documents' ? (
        <section className="alumnos-pdf">
          <h3>Ficha médica en PDF</h3>
          <p>Consultá la ficha escaneada del alumno.</p>
          {canManage && (
            <form className="alumnos-pdf-form" onSubmit={uploadPdf}>
              <label htmlFor="medical-pdf">Seleccionar PDF (máximo 10 MB)</label>
              <input
                key={pdfInputKey}
                id="medical-pdf"
                type="file"
                accept=".pdf,application/pdf"
                onChange={(event) => setPdfFile(event.target.files?.[0] || null)}
                disabled={pdfBusy}
              />
              <button className="alumnos-primary" type="submit" disabled={!pdfFile || pdfBusy}>
                {pdfBusy ? 'Procesando...' : 'Subir'}
              </button>
            </form>
          )}
          {pdfMessage && <p className="alumnos-message" role="status">{pdfMessage}</p>}
        </section>
      ) : (
        <section className="alumnos-pdf">
          <h3>Ficha médica en PDF</h3>
          {pdfBusy && <p role="status">Cargando ficha médica...</p>}
          {pdfMessage && <p className="alumnos-message" role="status">{pdfMessage}</p>}
          {pdfUrl && (
            <div className="alumnos-pdf-preview">
              <iframe title="Ficha médica en PDF" src={pdfUrl} />
            </div>
          )}
        </section>
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
