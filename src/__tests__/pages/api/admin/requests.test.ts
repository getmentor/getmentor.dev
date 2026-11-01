import { createMocks } from 'node-mocks-http'
import type { NextApiRequest, NextApiResponse } from 'next'

jest.mock('@/lib/logger', () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  logError: jest.fn(),
  logHttpRequest: jest.fn(),
}))

const mockList = jest.fn()
const mockGet = jest.fn()
const mockUpdateStatus = jest.fn()

jest.mock('@/lib/go-api-client', () => {
  class HttpError extends Error {
    constructor(public statusCode: number, public statusText: string, public body: string) {
      super(`HTTP ${statusCode}: ${statusText}`)
    }
  }
  return {
    HttpError,
    getGoApiClient: () => ({
      adminListRequests: mockList,
      adminGetRequestById: mockGet,
      adminUpdateRequestStatus: mockUpdateStatus,
    }),
  }
})

import listHandler from '@/pages/api/admin/requests'
import getHandler from '@/pages/api/admin/requests/[id]'
import statusHandler from '@/pages/api/admin/requests/[id]/status'
import { HttpError } from '@/lib/go-api-client'
import { buildAdminRequestsQueryString } from '@/types'

describe('api/admin/requests', () => {
  beforeEach(() => jest.clearAllMocks())

  it('returns 401 without cookies', async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({ method: 'GET' })
    await listHandler(req, res)
    expect(res.statusCode).toBe(401)
  })

  it('forwards only known filter params', async () => {
    mockList.mockResolvedValue({ requests: [], total: 0, page: 2, pageSize: 20, totalPages: 0 })
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'GET',
      headers: { cookie: 'admin_session=x' },
      query: { page: '2', mentorId: '42', menteeEmail: 'a@b.c', evil: 'drop' },
    })
    await listHandler(req, res)
    expect(res.statusCode).toBe(200)
    expect(mockList).toHaveBeenCalledWith('admin_session=x', {
      page: '2',
      mentorId: '42',
      menteeEmail: 'a@b.c',
    })
  })

  it('passes through Go API errors', async () => {
    mockList.mockRejectedValue(
      new HttpError(400, 'Bad Request', JSON.stringify({ error: 'Invalid mentorId filter' }))
    )
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'GET',
      headers: { cookie: 'admin_session=x' },
      query: { mentorId: 'abc' },
    })
    await listHandler(req, res)
    expect(res.statusCode).toBe(400)
    expect(res._getJSONData()).toEqual({ error: 'Invalid mentorId filter' })
  })
})

describe('api/admin/requests/[id]', () => {
  beforeEach(() => jest.clearAllMocks())

  it('returns request details', async () => {
    mockGet.mockResolvedValue({ id: 'r1', status: 'done', review: null })
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'GET',
      headers: { cookie: 'admin_session=x' },
      query: { id: 'r1' },
    })
    await getHandler(req, res)
    expect(res.statusCode).toBe(200)
    expect(res._getJSONData()).toEqual({ request: { id: 'r1', status: 'done', review: null } })
  })

  it('maps 404 from Go API', async () => {
    mockGet.mockRejectedValue(new HttpError(404, 'Not Found', '{"error":"Request not found"}'))
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'GET',
      headers: { cookie: 'admin_session=x' },
      query: { id: 'missing' },
    })
    await getHandler(req, res)
    expect(res.statusCode).toBe(404)
  })
})

describe('api/admin/requests/[id]/status', () => {
  beforeEach(() => jest.clearAllMocks())

  it('rejects unknown statuses', async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
      headers: { cookie: 'admin_session=x' },
      query: { id: 'r1' },
      body: { status: 'terminated' },
    })
    await statusHandler(req, res)
    expect(res.statusCode).toBe(400)
    expect(mockUpdateStatus).not.toHaveBeenCalled()
  })

  it('allows restoring a closed request', async () => {
    mockUpdateStatus.mockResolvedValue({ id: 'r1', status: 'pending' })
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
      headers: { cookie: 'admin_session=x' },
      query: { id: 'r1' },
      body: { status: 'pending' },
    })
    await statusHandler(req, res)
    expect(res.statusCode).toBe(200)
    expect(mockUpdateStatus).toHaveBeenCalledWith('admin_session=x', 'r1', { status: 'pending' })
  })
})

describe('buildAdminRequestsQueryString', () => {
  it('skips empty values', () => {
    expect(
      buildAdminRequestsQueryString({ page: 1, mentorId: ' ', mentorName: 'Ivan', status: '' })
    ).toBe('page=1&mentorName=Ivan')
  })
})
