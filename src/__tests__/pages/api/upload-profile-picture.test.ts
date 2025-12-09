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

const mockUploadProfilePicture = jest.fn()

jest.mock('@/lib/go-api-client', () => ({
  getGoApiClient: () => ({
    uploadProfilePicture: mockUploadProfilePicture,
  }),
}))

// Import handler after mocks are set up
import handler from '@/pages/api/upload-profile-picture'

describe('api/upload-profile-picture', () => {
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

  it('returns 400 when authentication headers are missing', async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
      body: { imageData: 'base64data' },
    })

    await handler(req, res)

    expect(res.statusCode).toBe(400)
    expect(res._getJSONData()).toEqual({ error: 'Missing authentication headers' })
  })

  it('returns 400 when only x-mentor-id is provided', async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
      headers: {
        'x-mentor-id': 'mentor-123',
      },
      body: { imageData: 'base64data' },
    })

    await handler(req, res)

    expect(res.statusCode).toBe(400)
    expect(res._getJSONData()).toEqual({ error: 'Missing authentication headers' })
  })

  it('forwards upload request to Go API with auth headers', async () => {
    const imageData = {
      imageData: 'base64-encoded-image-data',
      mimeType: 'image/jpeg',
    }

    const mockResponse = {
      success: true,
      imageUrl: 'https://storage.example.com/profile/mentor-123.jpg',
    }
    mockUploadProfilePicture.mockResolvedValue(mockResponse)

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
      headers: {
        'x-mentor-id': 'mentor-123',
        'x-auth-token': 'valid-auth-token',
      },
      body: imageData,
    })

    await handler(req, res)

    expect(mockUploadProfilePicture).toHaveBeenCalledWith(
      'mentor-123',
      'valid-auth-token',
      imageData
    )
    expect(res.statusCode).toBe(200)
    expect(res._getJSONData()).toEqual(mockResponse)
  })

  it('returns 500 when Go API throws an error', async () => {
    mockUploadProfilePicture.mockRejectedValue(new Error('Upload failed'))

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
      headers: {
        'x-mentor-id': 'mentor-123',
        'x-auth-token': 'valid-token',
      },
      body: { imageData: 'base64data' },
    })

    await handler(req, res)

    expect(res.statusCode).toBe(500)
    expect(res._getJSONData()).toEqual({ error: 'Internal server error' })
  })
})
