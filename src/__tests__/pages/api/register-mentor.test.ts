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

const mockRegisterMentor = jest.fn()

jest.mock('@/lib/go-api-client', () => ({
  getGoApiClient: () => ({
    registerMentor: mockRegisterMentor,
  }),
}))

// Import handler after mocks are set up
import handler from '@/pages/api/register-mentor'

describe('api/register-mentor', () => {
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

  it('forwards registration request to Go API and returns response', async () => {
    const registrationData = {
      name: 'John Doe',
      email: 'john@example.com',
      telegram: 'johndoe',
      job: 'Senior Engineer',
      workplace: 'Tech Company',
      experience: '10+',
      price: '5000 руб',
      tags: ['Backend', 'Go'],
      about: '<p>Experienced engineer</p>',
      description: '<p>Can help with Go and microservices</p>',
      competencies: 'Go, Kubernetes, PostgreSQL',
      calendarUrl: 'https://calendly.com/johndoe',
      profilePicture: {
        image: 'data:image/jpeg;base64,fake-data',
        fileName: 'profile.jpg',
        contentType: 'image/jpeg',
      },
      recaptchaToken: 'valid-token',
    }

    const mockResponse = { success: true, message: 'Registration successful', mentorId: 123 }
    mockRegisterMentor.mockResolvedValue(mockResponse)

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
      body: registrationData,
    })

    await handler(req, res)

    expect(mockRegisterMentor).toHaveBeenCalledWith(registrationData)
    expect(res.statusCode).toBe(200)
    expect(res._getJSONData()).toEqual(mockResponse)
  })

  it('returns 500 when Go API throws an error', async () => {
    mockRegisterMentor.mockRejectedValue(new Error('API connection failed'))

    const registrationData = {
      name: 'John Doe',
      email: 'john@example.com',
      telegram: 'johndoe',
      job: 'Engineer',
      workplace: 'Company',
      experience: '10+',
      price: '5000 руб',
      tags: ['Backend'],
      about: 'About me',
      description: 'Description',
      competencies: 'Skills',
      profilePicture: {
        image: 'data:image/jpeg;base64,fake-data',
        fileName: 'profile.jpg',
        contentType: 'image/jpeg',
      },
      recaptchaToken: 'token',
    }

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
      body: registrationData,
    })

    await handler(req, res)

    expect(res.statusCode).toBe(500)
    expect(res._getJSONData()).toEqual({ error: 'Internal server error' })
  })

  it('handles ReCAPTCHA failure response from Go API', async () => {
    const registrationData = {
      name: 'John Doe',
      email: 'john@example.com',
      telegram: 'johndoe',
      job: 'Engineer',
      workplace: 'Company',
      experience: '10+',
      price: '5000 руб',
      tags: ['Backend'],
      about: 'About me',
      description: 'Description',
      competencies: 'Skills',
      profilePicture: {
        image: 'data:image/jpeg;base64,fake-data',
        fileName: 'profile.jpg',
        contentType: 'image/jpeg',
      },
      recaptchaToken: 'invalid-token',
    }

    const mockResponse = { success: false, error: 'Captcha verification failed' }
    mockRegisterMentor.mockResolvedValue(mockResponse)

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
      body: registrationData,
    })

    await handler(req, res)

    expect(mockRegisterMentor).toHaveBeenCalledWith(registrationData)
    expect(res.statusCode).toBe(200)
    expect(res._getJSONData()).toEqual(mockResponse)
  })

  it('handles missing required fields', async () => {
    const incompleteData = {
      name: 'John Doe',
      // Missing other required fields
    }

    const mockResponse = { success: false, error: 'Validation failed' }
    mockRegisterMentor.mockResolvedValue(mockResponse)

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
      body: incompleteData,
    })

    await handler(req, res)

    expect(res.statusCode).toBe(200)
  })
})
