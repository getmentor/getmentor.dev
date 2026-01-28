/**
 * API service for Mentor Admin (Client-side)
 *
 * Calls Next.js API routes which proxy to the Go backend.
 * Uses HttpOnly cookies for session management.
 */

import type {
  MentorClientRequest,
  RequestStatus,
  DeclineRequestPayload,
  MentorSession,
  AuthResponse,
  RequestsListResponse,
} from '@/types'

/**
 * API error class for typed error handling
 */
export class ApiError extends Error {
  constructor(message: string, public status: number, public details?: unknown) {
    super(message)
    this.name = 'ApiError'
  }
}

/**
 * Make an API request to Next.js API routes
 * Includes credentials for cookie-based auth
 */
async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(endpoint, {
    ...options,
    credentials: 'include', // Required for HttpOnly cookies
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })

  // Handle non-OK responses
  if (!response.ok) {
    let errorMessage = 'Произошла ошибка'
    let errorDetails: unknown

    try {
      const errorData = await response.json()
      errorMessage = errorData.error || errorData.message || errorMessage
      errorDetails = errorData.details
    } catch {
      // Response is not JSON
    }

    throw new ApiError(errorMessage, response.status, errorDetails)
  }

  // Handle empty responses
  const contentType = response.headers.get('content-type')
  if (!contentType || !contentType.includes('application/json')) {
    return {} as T
  }

  return response.json()
}

// ============================================
// Session Management
// ============================================

/**
 * Session cache to avoid repeated API calls
 * Session is validated via cookies, this is just for UI state
 */
let cachedSession: MentorSession | null = null

/**
 * Get current session from backend
 * Returns null if not authenticated
 */
export async function getMentorSession(): Promise<MentorSession | null> {
  // Return cached session if available and not expired
  if (cachedSession && cachedSession.exp * 1000 > Date.now()) {
    return cachedSession
  }

  try {
    const response = await apiRequest<{ success: boolean; session?: MentorSession }>(
      '/api/mentor/auth/session'
    )

    if (response.success && response.session) {
      cachedSession = response.session
      return response.session
    }

    return null
  } catch (error) {
    // 401 means not authenticated
    if (error instanceof ApiError && error.status === 401) {
      cachedSession = null
      return null
    }
    throw error
  }
}

/**
 * Clear cached session
 */
export function clearMentorSession(): void {
  cachedSession = null
}

/**
 * Check if session is likely valid (client-side check)
 * Actual validation happens on backend with cookies
 */
export function isSessionValid(): boolean {
  return cachedSession !== null && cachedSession.exp * 1000 > Date.now()
}

// ============================================
// Auth API
// ============================================

/**
 * Request login token to be sent via email
 *
 * For security/privacy reasons, always returns success with a generic message.
 * This prevents email enumeration attacks.
 */
export async function requestLogin(email: string): Promise<AuthResponse> {
  const genericSuccessMessage =
    'Если ваш email зарегистрирован в системе, вы получите ссылку для входа'

  try {
    await apiRequest<{ success: boolean; message?: string }>('/api/mentor/auth/request-login', {
      method: 'POST',
      body: JSON.stringify({ email }),
    })

    return {
      success: true,
      message: genericSuccessMessage,
    }
  } catch (error) {
    // Only show error for actual network failures
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return {
        success: false,
        message: 'Не удалось подключиться к серверу. Проверьте соединение.',
      }
    }

    // For all other errors (including 403, 404, etc.), return generic success
    // This prevents revealing whether an email exists in the system
    return {
      success: true,
      message: genericSuccessMessage,
    }
  }
}

/**
 * Verify login token and create session
 * Backend sets HttpOnly cookie on success
 */
export async function verifyLogin(token: string): Promise<AuthResponse> {
  try {
    const response = await apiRequest<{
      success: boolean
      session?: MentorSession
      error?: string
    }>('/api/mentor/auth/verify', {
      method: 'POST',
      body: JSON.stringify({ token }),
    })

    if (response.success && response.session) {
      // Cache the session for UI state
      cachedSession = response.session
      return {
        success: true,
        session: response.session,
      }
    }

    return {
      success: false,
      message: response.error || 'Не удалось выполнить вход',
    }
  } catch (error) {
    if (error instanceof ApiError) {
      return {
        success: false,
        message: error.message,
      }
    }
    return {
      success: false,
      message: 'Недействительный или просроченный токен',
    }
  }
}

/**
 * Logout - clears session cookie
 */
export async function logout(): Promise<void> {
  try {
    await apiRequest<{ success: boolean }>('/api/mentor/auth/logout', {
      method: 'POST',
    })
  } finally {
    // Clear cached session regardless of API result
    cachedSession = null
  }
}

// ============================================
// Requests API
// ============================================

/**
 * Get active requests (pending, contacted, working)
 */
export async function getActiveRequests(): Promise<MentorClientRequest[]> {
  const response = await apiRequest<RequestsListResponse>('/api/mentor/requests?group=active')
  return response.requests
}

/**
 * Get past requests (done, declined, unavailable)
 */
export async function getPastRequests(): Promise<MentorClientRequest[]> {
  const response = await apiRequest<RequestsListResponse>('/api/mentor/requests?group=past')
  return response.requests
}

/**
 * Get single request by ID
 */
export async function getRequestById(id: string): Promise<MentorClientRequest | null> {
  try {
    const response = await apiRequest<MentorClientRequest>(
      `/api/mentor/requests/${encodeURIComponent(id)}`
    )
    return response
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return null
    }
    throw error
  }
}

/**
 * Update request status
 */
export async function updateRequestStatus(
  id: string,
  newStatus: RequestStatus
): Promise<MentorClientRequest> {
  const response = await apiRequest<MentorClientRequest>(
    `/api/mentor/requests/${encodeURIComponent(id)}/status`,
    {
      method: 'POST',
      body: JSON.stringify({ status: newStatus }),
    }
  )
  return response
}

/**
 * Decline request with reason
 */
export async function declineRequest(
  id: string,
  payload: DeclineRequestPayload
): Promise<MentorClientRequest> {
  const response = await apiRequest<MentorClientRequest>(
    `/api/mentor/requests/${encodeURIComponent(id)}/decline`,
    {
      method: 'POST',
      body: JSON.stringify(payload),
    }
  )
  return response
}
