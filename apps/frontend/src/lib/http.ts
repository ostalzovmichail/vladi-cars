const originalFetch = window.fetch.bind(window)

window.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
  const res = await originalFetch(input, init)
  if (res.status === 401) {
    localStorage.removeItem('vladi_token')
    localStorage.removeItem('vladi_user')
    const currentPath = window.location.pathname
    if (currentPath !== '/login' && currentPath !== '/register') {
      window.location.href = '/login'
    }
  }
  return res
}
