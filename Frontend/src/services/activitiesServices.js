import { apiRequest } from './api'

// Obtener todas las actividades
export function getActividades() {
  return apiRequest('/Activity')
}

// Obtener una actividad por ID
export function getActividadPorId(id) {
  return apiRequest(`/Activity/${id}`)
}

// Crear una actividad
export function crearActividad(datos) {
  return apiRequest('/Activity', {
    method: 'POST',
    body: JSON.stringify(datos)
  })
}

// Actualizar una actividad
export function actualizarActividad(id, datos) {
  return apiRequest(`/Activity/${id}`, {
    method: 'PUT',
    body: JSON.stringify(datos)
  })
}

// Eliminar una actividad
export function eliminarActividad(id) {
  return apiRequest(`/Activity/${id}`, {
    method: 'DELETE'
  })
}