// API client that auto-includes JWT token
export async function apiFetch(url: string, options: RequestInit = {}) {
  let token = ''
  if (typeof window !== 'undefined') {
    token = localStorage.getItem('tiendapp_token') || ''
  }

  const headers = new Headers(options.headers || {})
  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }
  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json')
  }

  const res = await fetch(url, { ...options, headers })

  if (res.status === 401) {
    // Token expired - logout
    if (typeof window !== 'undefined') {
      localStorage.removeItem('tiendapp_token')
      localStorage.removeItem('tiendapp_user')
      window.location.href = '/login'
    }
  }

  return res
}
