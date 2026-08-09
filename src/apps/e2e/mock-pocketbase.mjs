import { createServer } from 'http'

const EMPTY_LIST = JSON.stringify({ page: 1, perPage: 500, totalItems: 0, totalPages: 1, items: [] })
const AUTH_OK = JSON.stringify({ token: 'mock-token', record: { id: 'mock', email: 'ci@test.com', verified: true } })

const server = createServer((req, res) => {
  res.setHeader('Content-Type', 'application/json')

  if (req.method === 'POST' && req.url?.includes('auth-with-password')) {
    res.end(AUTH_OK)
  } else if (req.url?.includes('/api/collections/')) {
    res.end(EMPTY_LIST)
  } else if (req.url === '/api/health') {
    res.end(JSON.stringify({ code: 200, message: 'API is healthy.' }))
  } else {
    res.statusCode = 404
    res.end(JSON.stringify({ code: 404, message: 'Not found' }))
  }
})

// Bind to 127.0.0.1 (not 'localhost') so the mock is reachable on the same
// IPv4 address the app is configured with, regardless of how 'localhost'
// resolves (::1 on some systems).
server.listen(8090, '127.0.0.1', () => {
  console.log('Mock PocketBase running on http://127.0.0.1:8090')
})
