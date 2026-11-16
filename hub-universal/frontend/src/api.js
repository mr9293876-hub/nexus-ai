const API = '/api'

export async function api(path, options = {}) {
  const token = localStorage.getItem('hub_token')
  const response = await fetch(`${API}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(options.headers || {}) }
  })
  if (!response.ok) throw new Error((await response.json()).detail || 'Erro na API')
  return response.json()
}
