import logger from '@/lib/logger'
import { createMocks } from 'node-mocks-http'
import handler from '@/pages/api/healthcheck'

jest.mock('@/lib/logger', () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  logError: jest.fn(),
  logHttpRequest: jest.fn(),
}))

describe('api/healthcheck', () => {
  it('returns 200 and disables cache', async () => {
    const { req, res } = createMocks({
      method: 'GET',
    })

    await handler(req, res)

    expect(res.statusCode).toBe(200)
    expect(res._getHeaders()['cache-control']).toBe(
      'no-cache, no-store, max-age=0, must-revalidate'
    )
    expect(res._getData()).toEqual('{}')

    expect((logger as unknown as { logHttpRequest: jest.Mock }).logHttpRequest).toHaveBeenCalled()
  })
})
