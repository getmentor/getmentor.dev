/**
 * HTTP client for Go API backend
 * Handles authentication, retries, error handling for calls to the Go API
 */

import { context, propagation } from '@opentelemetry/api'
import type {
  MentorBase,
  MentorWithSecureFields,
  MentorListItem,
  GetAllMentorsParams,
  GetOneMentorParams,
  ContactMentorRequest,
  ContactMentorResponse,
  SaveProfileRequest,
  SaveProfileResponse,
  UploadProfilePictureRequest,
  UploadProfilePictureResponse,
  RegisterMentorRequest,
  RegisterMentorResponse,
} from '@/types'

// HTTP client configuration
const HTTP_CONFIG = {
  TIMEOUT_MS: 30000, // 30 seconds
} as const

/**
 * Custom error class for HTTP errors with status code
 */
export class HttpError extends Error {
  statusCode: number
  statusText: string
  body: string

  constructor(statusCode: number, statusText: string, body: string) {
    super(`Go API error: ${statusCode} ${statusText} - ${body}`)
    this.name = 'HttpError'
    this.statusCode = statusCode
    this.statusText = statusText
    this.body = body
  }
}

interface RequestOptions {
  headers?: Record<string, string>
  body?: Record<string, unknown>
}

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE'

class GoApiClient {
  private baseURL: string
  private internalToken: string
  private timeout: number

  constructor(baseURL: string, internalToken: string) {
    this.baseURL = baseURL
    this.internalToken = internalToken
    this.timeout = HTTP_CONFIG.TIMEOUT_MS
  }

  /**
   * Make an HTTP request to the Go API
   */
  async request<T>(method: HttpMethod, path: string, options: RequestOptions = {}): Promise<T> {
    const url = `${this.baseURL}${path}`
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'x-internal-mentors-api-auth-token': this.internalToken,
      ...options.headers,
    }

    // Inject W3C Trace Context headers for distributed tracing
    propagation.inject(context.active(), headers)

    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), this.timeout)

      const response = await fetch(url, {
        method,
        headers,
        body: options.body ? JSON.stringify(options.body) : undefined,
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        const errorText = await response.text()
        throw new HttpError(response.status, response.statusText, errorText)
      }

      return (await response.json()) as T
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error(`Go API request timeout after ${this.timeout}ms: ${path}`)
      }
      throw error
    }
  }

  /**
   * Get all mentors
   */
  async getAllMentors(params: GetAllMentorsParams = {}): Promise<MentorListItem[]> {
    return this.request<MentorListItem[]>('POST', '/api/v1/internal/mentors', {
      body: {
        only_visible: params.onlyVisible,
        drop_long_fields: params.drop_long_fields,
      },
    })
  }

  /**
   * Get a single mentor by slug
   */
  async getOneMentorBySlug(
    slug: string,
    params: GetOneMentorParams = {}
  ): Promise<MentorBase | MentorWithSecureFields | null> {
    try {
      return await this.request<MentorBase | MentorWithSecureFields>(
        'POST',
        `/api/v1/internal/mentors?slug=${slug}`,
        {
          body: {
            show_hidden: params.showHiddenFields,
          },
        }
      )
    } catch (error) {
      // Return null for 404 (mentor not found) - this is expected behavior
      if (error instanceof HttpError && error.statusCode === 404) {
        return null
      }
      // Re-throw other errors
      throw error
    }
  }

  /**
   * Get a single mentor by ID
   */
  async getOneMentorById(
    id: number,
    params: GetOneMentorParams = {}
  ): Promise<MentorBase | MentorWithSecureFields | null> {
    try {
      return await this.request<MentorBase | MentorWithSecureFields>(
        'POST',
        `/api/v1/internal/mentors?id=${id}`,
        {
          body: {
            show_hidden: params.showHiddenFields,
          },
        }
      )
    } catch (error) {
      // Return null for 404 (mentor not found) - this is expected behavior
      if (error instanceof HttpError && error.statusCode === 404) {
        return null
      }
      // Re-throw other errors
      throw error
    }
  }

  /**
   * Get a single mentor by Airtable record ID
   */
  async getOneMentorByRecordId(
    rec: string,
    params: GetOneMentorParams = {}
  ): Promise<MentorBase | MentorWithSecureFields> {
    return this.request<MentorBase | MentorWithSecureFields>(
      'POST',
      `/api/v1/internal/mentors?rec=${rec}`,
      {
        body: {
          show_hidden: params.showHiddenFields,
        },
      }
    )
  }

  /**
   * Save mentor profile
   */
  async saveProfile(
    mentorId: string,
    authToken: string,
    profileData: SaveProfileRequest
  ): Promise<SaveProfileResponse> {
    return this.request<SaveProfileResponse>('POST', '/api/v1/save-profile', {
      headers: {
        'X-Mentor-ID': mentorId,
        'X-Auth-Token': authToken,
      },
      body: profileData as unknown as Record<string, unknown>,
    })
  }

  /**
   * Upload profile picture
   */
  async uploadProfilePicture(
    mentorId: string,
    authToken: string,
    imageData: UploadProfilePictureRequest
  ): Promise<UploadProfilePictureResponse> {
    return this.request<UploadProfilePictureResponse>('POST', '/api/v1/upload-profile-picture', {
      headers: {
        'X-Mentor-ID': mentorId,
        'X-Auth-Token': authToken,
      },
      body: imageData as unknown as Record<string, unknown>,
    })
  }

  /**
   * Contact a mentor
   */
  async contactMentor(contactData: ContactMentorRequest): Promise<ContactMentorResponse> {
    return this.request<ContactMentorResponse>('POST', '/api/v1/contact-mentor', {
      body: contactData as unknown as Record<string, unknown>,
    })
  }

  /**
   * Register a new mentor
   */
  async registerMentor(registrationData: RegisterMentorRequest): Promise<RegisterMentorResponse> {
    return this.request<RegisterMentorResponse>('POST', '/api/v1/register-mentor', {
      body: registrationData as unknown as Record<string, unknown>,
    })
  }

  /**
   * Force refresh the cache in Go API
   */
  async forceRefreshCache(): Promise<{ success: boolean; message: string }> {
    return this.request<{ success: boolean; message: string }>(
      'POST',
      '/api/v1/internal/force_reset_cache',
      {}
    )
  }
}

// Singleton instance
let clientInstance: GoApiClient | null = null

/**
 * Get or create the Go API client singleton
 */
export function getGoApiClient(): GoApiClient {
  if (!clientInstance) {
    const baseURL = process.env.NEXT_PUBLIC_GO_API_URL || 'http://localhost:8081'
    const token = process.env.GO_API_INTERNAL_TOKEN || ''

    if (!token) {
      console.warn('GO_API_INTERNAL_TOKEN not set, API calls may fail')
    }

    clientInstance = new GoApiClient(baseURL, token)
  }
  return clientInstance
}

export default GoApiClient
