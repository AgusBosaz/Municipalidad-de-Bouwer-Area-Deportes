// path starts with '/', without including /api.
// For POST or PUT, pass body: JSON.stringify(data) in options.
export async function apiRequest(path, options = {}) {
  const headers = new Headers(options.headers)

  if (typeof options.body === 'string' && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  const response = await fetch(`/api${path}`, { ...options, headers })

  if (!response.ok) {
    const details = await response.text()
    const error = new Error(details || `HTTP error ${response.status}`)
    error.status = response.status
    throw error
  }

  if (response.status === 204) {
    return null
  }

  const content = await response.text()
  if (!content) {
    return null
  }

  if (response.headers.get('Content-Type')?.includes('json')) {
    return JSON.parse(content)
  }

  return content
}
