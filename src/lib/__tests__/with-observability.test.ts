jest.mock('@/lib/metrics', () => ({
  httpRequestDuration: { observe: jest.fn() },
  httpRequestTotal: { inc: jest.fn() },
  activeRequests: { inc: jest.fn(), dec: jest.fn() },
}))
jest.mock('@/lib/logger', () => ({ logHttpRequest: jest.fn(), logError: jest.fn() }))

import { normalizeRoute } from '@/lib/with-observability'

describe('normalizeRoute', () => {
  const id = '2f1a3f2a-ffa2-480a-bac3-b74642372c47'

  it('normalizes admin request detail and status routes', () => {
    expect(normalizeRoute(`/api/admin/requests/${id}`)).toBe('/api/admin/requests/:id')
    expect(normalizeRoute(`/api/admin/requests/${id}/status`)).toBe(
      '/api/admin/requests/:id/status'
    )
  })

  it('normalizes non-UUID admin request IDs too', () => {
    expect(normalizeRoute('/api/admin/requests/whatever?x=1')).toBe('/api/admin/requests/:id')
  })

  it('keeps the admin requests list route and drops the query string', () => {
    expect(normalizeRoute('/api/admin/requests?page=2&mentorId=42')).toBe('/api/admin/requests')
  })
})
