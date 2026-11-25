/**
 * @jest-environment node
 */
import { createMocks } from 'node-mocks-http'
import type { NextApiHandler, NextApiRequest, NextApiResponse } from 'next'

jest.mock('@/lib/logger', () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  logError: jest.fn(),
  logHttpRequest: jest.fn(),
}))

const mockMentorVerify = jest.fn()
const mockAdminVerify = jest.fn()
jest.mock('@/lib/go-api-client', () => {
  class HttpError extends Error {
    constructor(public statusCode: number, public statusText: string, public body: string) {
      super(`HTTP ${statusCode}: ${statusText}`)
    }
  }
  return {
    HttpError,
    getGoApiClient: () => ({
      mentorVerifyLogin: mockMentorVerify,
      adminVerifyLogin: mockAdminVerify,
    }),
  }
})

import mentorVerify from '@/pages/api/mentor/auth/verify'
import adminVerify from '@/pages/api/admin/auth/verify'
import { HttpError } from '@/lib/go-api-client'

const cases: [string, NextApiHandler, jest.Mock, string, string, string][] = [
  [
    'mentor',
    mentorVerify,
    mockMentorVerify,
    'mentor_login_token',
    `mtk_${'a'.repeat(64)}_1764059000`,
    'mentor_session',
  ],
  [
    'admin',
    adminVerify,
    mockAdminVerify,
    'admin_login_token',
    `atk_${'b'.repeat(64)}_1764059000`,
    'admin_session',
  ],
]

describe.each(cases)(
  'api/%s/auth/verify',
  (realm, handler, mockVerify, cookieName, token, sessionCookie) => {
    beforeEach(() => jest.clearAllMocks())

    it('reads the token from the pending cookie, forwards the session and clears the pending cookie', async () => {
      mockVerify.mockResolvedValueOnce({
        data: { success: true, session: {} },
        headers: new Headers({ 'set-cookie': `${sessionCookie}=jwt; HttpOnly` }),
      })
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        cookies: { [cookieName]: token },
        body: {},
      })
      await handler(req, res)
      expect(res._getStatusCode()).toBe(200)
      expect(mockVerify).toHaveBeenCalledWith(token)
      const cookies = res.getHeader('Set-Cookie') as string[]
      expect(cookies[0]).toContain(`${sessionCookie}=jwt`)
      expect(cookies[1]).toContain(`${cookieName}=; Path=/api/${realm}/auth/verify; Max-Age=0`)
    })

    it('ignores a token in the body: only the HttpOnly cookie is accepted', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        body: { token },
      })
      await handler(req, res)
      expect(res._getStatusCode()).toBe(401)
      expect(mockVerify).not.toHaveBeenCalled()
    })

    it("ignores another realm's pending cookie", async () => {
      const other = realm === 'mentor' ? 'admin_login_token' : 'mentor_login_token'
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        cookies: { [other]: token },
      })
      await handler(req, res)
      expect(res._getStatusCode()).toBe(401)
      expect(mockVerify).not.toHaveBeenCalled()
    })

    it('passes an invalid token through as 401 and still clears the pending cookie', async () => {
      mockVerify.mockRejectedValueOnce(
        new HttpError(401, 'Unauthorized', '{"error":"Invalid token"}')
      )
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        cookies: { [cookieName]: token },
      })
      await handler(req, res)
      expect(res._getStatusCode()).toBe(401)
      expect(String(res.getHeader('Set-Cookie'))).toContain(`${cookieName}=;`)
    })
  }
)
