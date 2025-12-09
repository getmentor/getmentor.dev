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

const mockContactMentor = jest.fn()

jest.mock('@/lib/go-api-client', () => ({
  getGoApiClient: () => ({
    contactMentor: mockContactMentor,
  }),
}))

// Import handler after mocks are set up
import handler from '@/pages/api/contact-mentor'

describe('api/contact-mentor', () => {
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

  it('forwards contact request to Go API and returns response', async () => {
    const contactData = {
      mentorId: 'rec123',
      name: 'John Doe',
      email: 'john@example.com',
      message: 'Hello mentor!',
      recaptchaToken: 'valid-token',
    }

    const mockResponse = { success: true, message: 'Email sent' }
    mockContactMentor.mockResolvedValue(mockResponse)

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
      body: contactData,
    })

    await handler(req, res)

    expect(mockContactMentor).toHaveBeenCalledWith(contactData)
    expect(res.statusCode).toBe(200)
    expect(res._getJSONData()).toEqual(mockResponse)
  })

  it('returns 500 when Go API throws an error', async () => {
    mockContactMentor.mockRejectedValue(new Error('API connection failed'))

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
      body: { mentorId: 'rec123' },
    })

    await handler(req, res)

    expect(res.statusCode).toBe(500)
    expect(res._getJSONData()).toEqual({ error: 'Internal server error' })
  })
})
