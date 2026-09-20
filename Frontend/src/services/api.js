// ruta comienza con '/', sin incluir /api.
// Para POST o PUT, pasar body: JSON.stringify(datos) en opciones.
export async function solicitarApi(ruta, opciones = {}) {
  const headers = new Headers(opciones.headers)

  if (typeof opciones.body === 'string' && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  const respuesta = await fetch(`/api${ruta}`, { ...opciones, headers })

  if (!respuesta.ok) {
    const detalle = await respuesta.text()
    const error = new Error(detalle || `Error HTTP ${respuesta.status}`)
    error.status = respuesta.status
    throw error
  }

  if (respuesta.status === 204) {
    return null
  }

  const contenido = await respuesta.text()
  if (!contenido) {
    return null
  }

  if (respuesta.headers.get('Content-Type')?.includes('json')) {
    return JSON.parse(contenido)
  }

  return contenido
}
