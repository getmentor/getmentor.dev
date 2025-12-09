import { createMocks } from 'node-mocks-http'
import type { NextApiRequest, NextApiResponse } from 'next'

// Mock the dependencies before importing handler
jest.mock('@/lib/logger', () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  logError: jest.fn(),
  logHttpRequest: jest.fn(),
}))

const mockSaveProfile = jest.fn()

jest.mock('@/lib/go-api-client', () => ({
  getGoApiClient: () => ({
    saveProfile: mockSaveProfile,
  }),
}))

// Import handler after mocks are set up
import handler from '@/pages/api/save-profile'

describe('api/save-profile', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns 405 for non-POST requests', async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'GET',
    })

    await handler(req, res)

    expect(res.statusCode).toBe(405)
    expect(res._getJSONData()).toEqual({ error: 'Method not allowed' })
  })

  it('returns 400 when x-mentor-id header is missing', async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
      headers: {
        'x-auth-token': 'valid-token',
      },
      body: { name: 'Test' },
    })

    await handler(req, res)

    expect(res.statusCode).toBe(400)
    expect(res._getJSONData()).toEqual({ error: 'Missing authentication headers' })
  })

  it('returns 400 when x-auth-token header is missing', async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
      headers: {
        'x-mentor-id': 'mentor-123',
      },
      body: { name: 'Test' },
    })

    await handler(req, res)

    expect(res.statusCode).toBe(400)
    expect(res._getJSONData()).toEqual({ error: 'Missing authentication headers' })
  })

  it('forwards profile save request to Go API with auth headers', async () => {
    const profileData = {
      name: 'Updated Name',
      job: 'Senior Developer',
      description: 'Updated description',
    }

    const mockResponse = { success: true, mentor: { id: 123, name: 'Updated Name' } }
    mockSaveProfile.mockResolvedValue(mockResponse)

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
      headers: {
        'x-mentor-id': 'mentor-123',
        'x-auth-token': 'valid-auth-token',
      },
      body: profileData,
    })

    await handler(req, res)

    expect(mockSaveProfile).toHaveBeenCalledWith('mentor-123', 'valid-auth-token', profileData)
    expect(res.statusCode).toBe(200)
    expect(res._getJSONData()).toEqual(mockResponse)
  })

  it('handles array headers correctly', async () => {
    const mockResponse = { success: true }
    mockSaveProfile.mockResolvedValue(mockResponse)

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
      headers: {
        'x-mentor-id': ['mentor-123', 'ignored'],
        'x-auth-token': ['token-abc', 'ignored'],
      },
      body: { name: 'Test' },
    })

    await handler(req, res)

    expect(mockSaveProfile).toHaveBeenCalledWith('mentor-123', 'token-abc', { name: 'Test' })
    expect(res.statusCode).toBe(200)
  })

  it('returns 500 when Go API throws an error', async () => {
    mockSaveProfile.mockRejectedValue(new Error('API error'))

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
      headers: {
        'x-mentor-id': 'mentor-123',
        'x-auth-token': 'valid-token',
      },
      body: { name: 'Test' },
    })

    await handler(req, res)

    expect(res.statusCode).toBe(500)
    expect(res._getJSONData()).toEqual({ error: 'Internal server error' })
  })
})
