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
  MentorClientRequest,
  MentorSession,
  RequestStatus,
  DeclineRequestPayload,
  RequestsListResponse,
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

  // ============================================
  // Mentor Admin API Methods
  // ============================================

  /**
   * Make a request with cookie forwarding (for mentor admin auth)
   * Returns both the response data and headers (for Set-Cookie forwarding)
   */
  async requestWithCookies<T>(
    method: HttpMethod,
    path: string,
    options: RequestOptions & { cookies?: string } = {}
  ): Promise<{ data: T; headers: Headers }> {
    const url = `${this.baseURL}${path}`
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options.headers,
    }

    // Forward cookies if provided
    if (options.cookies) {
      headers['Cookie'] = options.cookies
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

      const data = (await response.json()) as T
      return { data, headers: response.headers }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error(`Go API request timeout after ${this.timeout}ms: ${path}`)
      }
      throw error
    }
  }

  /**
   * Request mentor login (send magic link)
   * This is a public endpoint - no auth required
   */
  async mentorRequestLogin(email: string): Promise<{ success: boolean; message?: string }> {
    const { data } = await this.requestWithCookies<{ success: boolean; message?: string }>(
      'POST',
      '/api/v1/auth/mentor/request-login',
      { body: { email } }
    )
    return data
  }

  /**
   * Verify mentor login token
   * Returns response with Set-Cookie header for session
   */
  async mentorVerifyLogin(
    token: string
  ): Promise<{
    data: { success: boolean; session?: MentorSession; error?: string }
    headers: Headers
  }> {
    return this.requestWithCookies<{ success: boolean; session?: MentorSession; error?: string }>(
      'POST',
      '/api/v1/auth/mentor/verify',
      { body: { token } }
    )
  }

  /**
   * Logout mentor (clear session)
   */
  async mentorLogout(cookies?: string): Promise<{ data: { success: boolean }; headers: Headers }> {
    return this.requestWithCookies<{ success: boolean }>('POST', '/api/v1/auth/mentor/logout', {
      cookies,
    })
  }

  /**
   * Get current mentor session
   */
  async mentorGetSession(
    cookies: string
  ): Promise<{ data: { success: boolean; session?: MentorSession }; headers: Headers }> {
    return this.requestWithCookies<{ success: boolean; session?: MentorSession }>(
      'GET',
      '/api/v1/auth/mentor/session',
      { cookies }
    )
  }

  /**
   * Get mentor's requests
   */
  async mentorGetRequests(
    cookies: string,
    group: 'active' | 'past'
  ): Promise<RequestsListResponse> {
    const { data } = await this.requestWithCookies<RequestsListResponse>(
      'GET',
      `/api/v1/mentor/requests?group=${group}`,
      { cookies }
    )
    return data
  }

  /**
   * Get single request by ID
   */
  async mentorGetRequestById(cookies: string, id: string): Promise<MentorClientRequest | null> {
    try {
      const { data } = await this.requestWithCookies<MentorClientRequest>(
        'GET',
        `/api/v1/mentor/requests/${encodeURIComponent(id)}`,
        { cookies }
      )
      return data
    } catch (error) {
      if (error instanceof HttpError && error.statusCode === 404) {
        return null
      }
      throw error
    }
  }

  /**
   * Update request status
   */
  async mentorUpdateRequestStatus(
    cookies: string,
    id: string,
    status: RequestStatus
  ): Promise<MentorClientRequest> {
    const { data } = await this.requestWithCookies<MentorClientRequest>(
      'POST',
      `/api/v1/mentor/requests/${encodeURIComponent(id)}/status`,
      { cookies, body: { status } }
    )
    return data
  }

  /**
   * Decline request
   */
  async mentorDeclineRequest(
    cookies: string,
    id: string,
    payload: DeclineRequestPayload
  ): Promise<MentorClientRequest> {
    const { data } = await this.requestWithCookies<MentorClientRequest>(
      'POST',
      `/api/v1/mentor/requests/${encodeURIComponent(id)}/decline`,
      { cookies, body: payload as unknown as Record<string, unknown> }
    )
    return data
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
