import { createMocks } from 'node-mocks-http'
import type { NextApiRequest, NextApiResponse } from 'next'

jest.mock('@/lib/logger', () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  logError: jest.fn(),
  logHttpRequest: jest.fn(),
}))

const mockMentorDelete = jest.fn()
const mockAdminDelete = jest.fn()
const mockAdminRestore = jest.fn()

jest.mock('@/lib/go-api-client', () => {
  class HttpError extends Error {
    constructor(public statusCode: number, public statusText: string, public body: string) {
      super(`HTTP ${statusCode}: ${statusText}`)
    }
  }
  return {
    HttpError,
    getGoApiClient: () => ({
      mentorDeleteProfile: mockMentorDelete,
      adminDeleteMentor: mockAdminDelete,
      adminRestoreMentor: mockAdminRestore,
    }),
  }
})

import mentorDeleteHandler from '@/pages/api/mentor/profile/delete'
import adminDeleteHandler from '@/pages/api/admin/mentors/[id]/delete'
import adminRestoreHandler from '@/pages/api/admin/mentors/[id]/restore'
import { HttpError } from '@/lib/go-api-client'

describe('api/mentor/profile/delete', () => {
  beforeEach(() => jest.clearAllMocks())

  it('rejects non-POST', async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({ method: 'GET' })
    await mentorDeleteHandler(req, res)
    expect(res.statusCode).toBe(405)
  })

  it('returns 401 without cookies', async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
      body: { slug: 'ivan-1' },
    })
    await mentorDeleteHandler(req, res)
    expect(res.statusCode).toBe(401)
  })

  it('requires a slug', async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
      headers: { cookie: 'mentor_session=x' },
      body: { slug: '  ' },
    })
    await mentorDeleteHandler(req, res)
    expect(res.statusCode).toBe(400)
    expect(mockMentorDelete).not.toHaveBeenCalled()
  })

  it('forwards the cleared session cookie', async () => {
    mockMentorDelete.mockResolvedValue({
      data: { success: true },
      headers: new Headers({ 'set-cookie': 'mentor_session=; Max-Age=0' }),
    })
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
      headers: { cookie: 'mentor_session=x' },
      body: { slug: ' ivan-1 ' },
    })
    await mentorDeleteHandler(req, res)
    expect(res.statusCode).toBe(200)
    expect(mockMentorDelete).toHaveBeenCalledWith('mentor_session=x', { slug: 'ivan-1' })
    expect(res.getHeader('Set-Cookie')).toBe('mentor_session=; Max-Age=0')
  })

  it('passes through backend errors', async () => {
    mockMentorDelete.mockRejectedValue(
      new HttpError(400, 'Bad Request', JSON.stringify({ error: 'Slug does not match' }))
    )
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
      headers: { cookie: 'mentor_session=x' },
      body: { slug: 'wrong' },
    })
    await mentorDeleteHandler(req, res)
    expect(res.statusCode).toBe(400)
    expect(res._getJSONData()).toEqual({ error: 'Slug does not match' })
  })
})

describe('api/admin/mentors/[id]/delete and restore', () => {
  beforeEach(() => jest.clearAllMocks())

  it('admin delete requires a slug', async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
      headers: { cookie: 'admin_session=x' },
      query: { id: 'm1' },
      body: {},
    })
    await adminDeleteHandler(req, res)
    expect(res.statusCode).toBe(400)
    expect(mockAdminDelete).not.toHaveBeenCalled()
  })

  it('admin delete proxies to the backend', async () => {
    mockAdminDelete.mockResolvedValue({ mentorId: 'm1', deletedAt: '2026-11-03T10:00:00Z' })
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
      headers: { cookie: 'admin_session=x' },
      query: { id: 'm1' },
      body: { slug: 'ivan-1' },
    })
    await adminDeleteHandler(req, res)
    expect(res.statusCode).toBe(200)
    expect(mockAdminDelete).toHaveBeenCalledWith('admin_session=x', 'm1', { slug: 'ivan-1' })
    expect(res._getJSONData().mentor.deletedAt).toBe('2026-11-03T10:00:00Z')
  })

  it('admin restore forwards 403 from the backend', async () => {
    mockAdminRestore.mockRejectedValue(
      new HttpError(403, 'Forbidden', JSON.stringify({ error: 'Access denied' }))
    )
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
      headers: { cookie: 'admin_session=x' },
      query: { id: 'm1' },
    })
    await adminRestoreHandler(req, res)
    expect(res.statusCode).toBe(403)
  })
})
