/**
 * Client-side API for the mentee dashboard. Calls Next.js API routes, which proxy to
 * the Go API. The session is an HttpOnly cookie (mentee_session).
 */

import type {
  MenteeRequestsResponse,
  MenteeReviewPayload,
  MenteeSession,
  MenteeDashboardRequest,
} from '@/types'

export class MenteeApiError extends Error {
  constructor(message: string, public status: number) {
    super(message)
    this.name = 'MenteeApiError'
  }
}

async function call<T>(endpoint: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(endpoint, {
    ...init,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...init.headers },
  })
  let body: Record<string, unknown> = {}
  try {
    body = await response.json()
  } catch {
    // not JSON
  }
  if (!response.ok) {
    const message =
      (typeof body.error === 'string' && body.error) ||
      (typeof body.message === 'string' && body.message) ||
      'Произошла ошибка'
    throw new MenteeApiError(message, response.status)
  }
  return body as T
}

export async function getMenteeSession(): Promise<MenteeSession | null> {
  try {
    const data = await call<{ success: boolean; session?: MenteeSession }>(
      '/api/mentee/auth/session'
    )
    return data.success && data.session ? data.session : null
  } catch (error) {
    if (error instanceof MenteeApiError && error.status === 401) return null
    throw error
  }
}

export async function requestMenteeLogin(
  email: string
): Promise<{ success: boolean; message?: string }> {
  try {
    return await call<{ success: boolean; message?: string }>('/api/mentee/auth/request-login', {
      method: 'POST',
      body: JSON.stringify({ email }),
    })
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof MenteeApiError ? error.message : 'Не удалось подключиться к серверу.',
    }
  }
}

export async function verifyMenteeLogin(token: string): Promise<MenteeSession | null> {
  try {
    const data = await call<{ success: boolean; session?: MenteeSession }>(
      '/api/mentee/auth/verify',
      { method: 'POST', body: JSON.stringify({ token }) }
    )
    return data.success && data.session ? data.session : null
  } catch {
    return null
  }
}

export async function logoutMentee(): Promise<void> {
  await call('/api/mentee/auth/logout', { method: 'POST' })
}

export async function getMenteeRequests(): Promise<MenteeDashboardRequest[]> {
  const data = await call<MenteeRequestsResponse>('/api/mentee/requests')
  return data.requests || []
}

/** The request id is sent in the body only, never in the URL. */
export async function submitMenteeReview(
  requestId: string,
  payload: MenteeReviewPayload
): Promise<void> {
  await call('/api/mentee/reviews', {
    method: 'POST',
    body: JSON.stringify({ requestId, ...payload }),
  })
}
