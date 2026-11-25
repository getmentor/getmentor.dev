/**
 * @jest-environment node
 */
import { createMocks } from 'node-mocks-http'
import type { NextApiHandler, NextApiRequest, NextApiResponse } from 'next'

const mockLogError = jest.fn()
jest.mock('@/lib/logger', () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  logError: (...args: unknown[]) => mockLogError(...args),
  logHttpRequest: jest.fn(),
}))

const mockRequestLogin = jest.fn()
const mockSubmitReview = jest.fn()
const mockGetRequests = jest.fn()
const mockVerify = jest.fn()

jest.mock('@/lib/go-api-client', () => {
  class HttpError extends Error {
    constructor(public statusCode: number, public statusText: string, public body: string) {
      super(`HTTP ${statusCode}: ${statusText}`)
    }
  }
  return {
    HttpError,
    getGoApiClient: () => ({
      menteeRequestLogin: mockRequestLogin,
      menteeSubmitReview: mockSubmitReview,
      menteeGetRequests: mockGetRequests,
      menteeVerifyLogin: mockVerify,
    }),
  }
})

import requestLoginHandler from '@/pages/api/mentee/auth/request-login'
import verifyHandler from '@/pages/api/mentee/auth/verify'
import reviewsHandler from '@/pages/api/mentee/reviews'
import requestsHandler from '@/pages/api/mentee/requests'
import { HttpError } from '@/lib/go-api-client'

const REQUEST_ID = '11111111-2222-3333-4444-555555555555'

async function call(handler: NextApiHandler, opts: Parameters<typeof createMocks>[0]) {
  const { req, res } = createMocks<NextApiRequest, NextApiResponse>(opts)
  await handler(req, res)
  return { status: res._getStatusCode(), body: res._getData() as string }
}

describe('api/mentee/auth/request-login', () => {
  beforeEach(() => jest.clearAllMocks())

  it('answers known and unknown emails identically', async () => {
    mockRequestLogin.mockResolvedValueOnce({ success: true, message: 'from go' })
    const known = await call(requestLoginHandler, {
      method: 'POST',
      body: { email: 'known@example.com' },
    })
    mockRequestLogin.mockRejectedValueOnce(new HttpError(404, 'Not Found', '{"error":"x"}'))
    const unknown = await call(requestLoginHandler, {
      method: 'POST',
      body: { email: 'unknown@example.com' },
    })
    expect(known.status).toBe(200)
    expect(unknown.status).toBe(known.status)
    expect(unknown.body).toEqual(known.body)
  })

  it('never logs the email', async () => {
    mockRequestLogin.mockRejectedValueOnce(new HttpError(503, 'Unavailable', 'down'))
    const res = await call(requestLoginHandler, {
      method: 'POST',
      body: { email: 'secret.person@example.com' },
    })
    expect(res.status).toBe(500)
    expect(mockLogError).toHaveBeenCalled()
    expect(JSON.stringify(mockLogError.mock.calls)).not.toContain('secret.person')
  })

  it('passes rate limiting through', async () => {
    mockRequestLogin.mockRejectedValueOnce(new HttpError(429, 'Too Many', '{}'))
    const res = await call(requestLoginHandler, {
      method: 'POST',
      body: { email: 'a@example.com' },
    })
    expect(res.status).toBe(429)
  })

  it.each([
    [{}],
    [{ email: 'nope' }],
    [{ email: 42 }],
    [{ email: `${'a'.repeat(250)}@example.com` }],
  ])('rejects invalid body %j without calling the API', async (body) => {
    const res = await call(requestLoginHandler, { method: 'POST', body })
    expect(res.status).toBe(400)
    expect(mockRequestLogin).not.toHaveBeenCalled()
  })

  it('rejects non-POST', async () => {
    expect((await call(requestLoginHandler, { method: 'GET' })).status).toBe(405)
  })
})

describe('api/mentee/auth/verify', () => {
  beforeEach(() => jest.clearAllMocks())
  const TOKEN = `mntk_${'a'.repeat(64)}`

  it('reads the token from the pending cookie, forwards the session and clears the pending cookie', async () => {
    mockVerify.mockResolvedValueOnce({
      data: { success: true, session: { mentee_id: 'm', exp: 1, iat: 1 } },
      headers: new Headers({ 'set-cookie': 'mentee_session=abc; HttpOnly' }),
    })
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
      cookies: { mentee_login_token: TOKEN },
      body: {},
    })
    await verifyHandler(req, res)
    expect(res._getStatusCode()).toBe(200)
    expect(mockVerify).toHaveBeenCalledWith(TOKEN)
    const cookies = res.getHeader('Set-Cookie') as string[]
    expect(cookies[0]).toContain('mentee_session=abc')
    expect(cookies[1]).toMatch(/^mentee_login_token=; Path=\/api\/mentee\/auth\/verify; Max-Age=0/)
  })

  it('ignores a token in the body: only the HttpOnly cookie is accepted', async () => {
    const res = await call(verifyHandler, { method: 'POST', body: { token: TOKEN } })
    expect(res.status).toBe(401)
    expect(mockVerify).not.toHaveBeenCalled()
  })

  it('passes an invalid token through as 401 and still clears the pending cookie', async () => {
    mockVerify.mockRejectedValueOnce(
      new HttpError(401, 'Unauthorized', '{"error":"Invalid token"}')
    )
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
      cookies: { mentee_login_token: TOKEN },
    })
    await verifyHandler(req, res)
    expect(res._getStatusCode()).toBe(401)
    expect(String(res.getHeader('Set-Cookie'))).toContain('mentee_login_token=;')
  })
})

describe('api/mentee/reviews', () => {
  beforeEach(() => jest.clearAllMocks())

  const valid = {
    requestId: REQUEST_ID,
    mentorReview: 'Отличный ментор, помог разобраться',
    platformReview: '',
    improvements: '',
    recaptchaToken: 'captcha',
  }

  it('sends the request id in the body, never in the path or query', async () => {
    mockSubmitReview.mockResolvedValueOnce({ success: true, reviewId: 'r1' })
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
      url: '/api/mentee/reviews',
      headers: { cookie: 'mentee_session=abc' },
      body: valid,
    })
    await reviewsHandler(req, res)
    expect(res._getStatusCode()).toBe(200)
    expect(mockSubmitReview).toHaveBeenCalledWith('mentee_session=abc', {
      ...valid,
      mentorReview: valid.mentorReview.trim(),
    })
    expect(req.url).not.toContain(REQUEST_ID)
  })

  it('requires a session cookie', async () => {
    const res = await call(reviewsHandler, { method: 'POST', body: valid })
    expect(res.status).toBe(401)
    expect(mockSubmitReview).not.toHaveBeenCalled()
  })

  it.each([
    ['non-uuid id', { ...valid, requestId: 'abc' }],
    ['short review', { ...valid, mentorReview: 'short' }],
    ['long review', { ...valid, mentorReview: 'a'.repeat(5001) }],
    ['long platform review', { ...valid, platformReview: 'a'.repeat(5001) }],
    ['long improvements', { ...valid, improvements: 'a'.repeat(5001) }],
    ['no captcha', { ...valid, recaptchaToken: '' }],
  ])('rejects %s', async (_, body) => {
    const res = await call(reviewsHandler, {
      method: 'POST',
      headers: { cookie: 'mentee_session=abc' },
      body,
    })
    expect(res.status).toBe(400)
    expect(mockSubmitReview).not.toHaveBeenCalled()
  })

  it('passes 404 (not owned or missing) through unchanged', async () => {
    mockSubmitReview.mockRejectedValueOnce(
      new HttpError(404, 'Not Found', '{"error":"Заявка не найдена"}')
    )
    const res = await call(reviewsHandler, {
      method: 'POST',
      headers: { cookie: 'mentee_session=abc' },
      body: valid,
    })
    expect(res.status).toBe(404)
    expect(JSON.parse(res.body)).toEqual({ error: 'Заявка не найдена' })
  })
})

describe('api/mentee/requests', () => {
  beforeEach(() => jest.clearAllMocks())

  it('requires a session cookie', async () => {
    expect((await call(requestsHandler, { method: 'GET' })).status).toBe(401)
  })

  it('returns the list and disables caching', async () => {
    mockGetRequests.mockResolvedValueOnce({ requests: [] })
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'GET',
      headers: { cookie: 'mentee_session=abc' },
    })
    await requestsHandler(req, res)
    expect(res._getStatusCode()).toBe(200)
    expect(res.getHeader('Cache-Control')).toBe('private, no-store')
  })
})
