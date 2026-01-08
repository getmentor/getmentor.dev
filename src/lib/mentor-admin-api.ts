/**
 * Mock API service for Mentor Admin
 *
 * This file contains mock implementations of the mentor admin API.
 * Will be replaced with actual API calls when backend is ready.
 */

import type {
  MentorClientRequest,
  RequestStatus,
  DeclineRequestPayload,
  MentorSession,
  AuthResponse,
} from '@/types'

// Simulated network delay
const MOCK_DELAY = 500

const delay = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms))

/**
 * Mock data for development
 */
const MOCK_REQUESTS: MentorClientRequest[] = [
  {
    id: 'req_001',
    email: 'ivan.petrov@example.com',
    name: 'Иван Петров',
    telegram: '@ivan_petrov',
    details:
      'Хочу разобраться в архитектуре микросервисов. Работаю бэкенд-разработчиком 2 года, но опыта с микросервисами нет. Интересует как правильно декомпозировать монолит и какие паттерны использовать.',
    level: 'Middle',
    createdAt: '2024-01-15T10:30:00Z',
    modifiedAt: '2024-01-15T10:30:00Z',
    statusChangedAt: '2024-01-15T10:30:00Z',
    scheduledAt: null,
    review: null,
    status: 'pending',
    mentorId: 'mentor_001',
    reviewUrl: null,
  },
  {
    id: 'req_002',
    email: 'anna.sidorova@example.com',
    name: 'Анна Сидорова',
    telegram: '@anna_s',
    details:
      'Ищу ментора для подготовки к собеседованиям в FAANG. Хочу системно подготовиться к system design интервью. Есть 5 лет опыта, но никогда не проходила такие собеседования.',
    level: 'Senior',
    createdAt: '2024-01-14T15:45:00Z',
    modifiedAt: '2024-01-16T09:00:00Z',
    statusChangedAt: '2024-01-16T09:00:00Z',
    scheduledAt: '2024-01-20T14:00:00Z',
    review: null,
    status: 'contacted',
    mentorId: 'mentor_001',
    reviewUrl: null,
  },
  {
    id: 'req_003',
    email: 'sergey.kozlov@example.com',
    name: 'Сергей Козлов',
    telegram: '@sergey_k',
    details:
      'Хочу перейти из QA в разработку. Изучаю Python последние полгода, написал несколько pet-проектов. Нужна помощь с составлением плана развития и код-ревью.',
    level: 'Junior',
    createdAt: '2024-01-10T08:00:00Z',
    modifiedAt: '2024-01-17T11:30:00Z',
    statusChangedAt: '2024-01-17T11:30:00Z',
    scheduledAt: '2024-01-18T16:00:00Z',
    review: null,
    status: 'working',
    mentorId: 'mentor_001',
    reviewUrl: null,
  },
  {
    id: 'req_004',
    email: 'maria.volkova@example.com',
    name: 'Мария Волкова',
    telegram: '@masha_v',
    details: 'Интересует карьерный рост до тимлида. Работаю разработчиком 4 года.',
    level: 'Senior',
    createdAt: '2024-01-05T12:00:00Z',
    modifiedAt: '2024-01-12T18:00:00Z',
    statusChangedAt: '2024-01-12T18:00:00Z',
    scheduledAt: '2024-01-08T10:00:00Z',
    review:
      'Отличный ментор! Помог составить план развития и дал много полезных советов по soft skills.',
    status: 'done',
    mentorId: 'mentor_001',
    reviewUrl: 'https://forms.google.com/review/123',
  },
  {
    id: 'req_005',
    email: 'dmitry.novikov@example.com',
    name: 'Дмитрий Новиков',
    telegram: '@dima_n',
    details: 'Хочу научиться писать чистый код и изучить паттерны проектирования.',
    level: 'Junior',
    createdAt: '2024-01-03T09:30:00Z',
    modifiedAt: '2024-01-04T14:00:00Z',
    statusChangedAt: '2024-01-04T14:00:00Z',
    scheduledAt: null,
    review: null,
    status: 'declined',
    mentorId: 'mentor_001',
    reviewUrl: null,
  },
  {
    id: 'req_006',
    email: 'olga.kuznetsova@example.com',
    name: 'Ольга Кузнецова',
    telegram: '@olga_k',
    details: 'Нужна помощь с выбором технологического стека для стартапа.',
    level: 'Middle',
    createdAt: '2023-12-28T16:00:00Z',
    modifiedAt: '2023-12-30T10:00:00Z',
    statusChangedAt: '2023-12-30T10:00:00Z',
    scheduledAt: null,
    review: null,
    status: 'unavailable',
    mentorId: 'mentor_001',
    reviewUrl: null,
  },
]

// In-memory store (simulating backend state)
let requestsStore = [...MOCK_REQUESTS]

/**
 * Mock session storage key
 */
const SESSION_KEY = 'mentor_session'

/**
 * Get session from localStorage (client-side only)
 */
export function getMentorSession(): MentorSession | null {
  if (typeof window === 'undefined') return null

  try {
    const stored = localStorage.getItem(SESSION_KEY)
    if (!stored) return null

    const session: MentorSession = JSON.parse(stored)

    // Check if session expired
    if (new Date(session.expiresAt) < new Date()) {
      localStorage.removeItem(SESSION_KEY)
      return null
    }

    return session
  } catch {
    return null
  }
}

/**
 * Set session in localStorage
 */
function setMentorSession(session: MentorSession): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(SESSION_KEY, JSON.stringify(session))
}

/**
 * Clear session from localStorage
 */
export function clearMentorSession(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(SESSION_KEY)
}

/**
 * Check if user is authenticated (for SSR)
 * In production, this would verify a cookie with the backend
 */
export function isAuthenticated(): boolean {
  return getMentorSession() !== null
}

// ============================================
// Auth API
// ============================================

/**
 * Request login (send magic link/token)
 */
export async function requestLogin(email: string): Promise<AuthResponse> {
  await delay(MOCK_DELAY)

  // Mock: accept any email containing 'mentor'
  if (!email.includes('@')) {
    return { success: false, message: 'Некорректный email' }
  }

  // In mock mode, we'll auto-generate a token and log it
  const mockToken = `mock_token_${Date.now()}`
  console.info(`[MOCK] Login token for ${email}: ${mockToken}`)
  console.info(`[MOCK] Use callback URL: /mentor/auth/callback?token=${mockToken}`)

  return { success: true, message: 'Ссылка для входа отправлена на вашу почту' }
}

/**
 * Verify login token and create session
 */
export async function verifyLogin(token: string): Promise<AuthResponse> {
  await delay(MOCK_DELAY)

  // Mock: accept any token starting with 'mock_token_'
  if (!token.startsWith('mock_token_')) {
    return { success: false, message: 'Недействительный или просроченный токен' }
  }

  // Create mock session (24 hours)
  const session: MentorSession = {
    mentorId: 'mentor_001',
    email: 'mentor@example.com',
    name: 'Тестовый Ментор',
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  }

  setMentorSession(session)

  return { success: true, session }
}

/**
 * Logout - clear session
 */
export async function logout(): Promise<void> {
  await delay(MOCK_DELAY / 2)
  clearMentorSession()
}

// ============================================
// Requests API
// ============================================

/**
 * Get active requests (pending, contacted, working)
 */
export async function getActiveRequests(): Promise<MentorClientRequest[]> {
  await delay(MOCK_DELAY)

  const session = getMentorSession()
  if (!session) throw new Error('Не авторизован')

  return requestsStore
    .filter(
      (r) =>
        r.mentorId === session.mentorId && ['pending', 'contacted', 'working'].includes(r.status)
    )
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
}

/**
 * Get past requests (done, declined, unavailable)
 */
export async function getPastRequests(): Promise<MentorClientRequest[]> {
  await delay(MOCK_DELAY)

  const session = getMentorSession()
  if (!session) throw new Error('Не авторизован')

  return requestsStore
    .filter(
      (r) =>
        r.mentorId === session.mentorId && ['done', 'declined', 'unavailable'].includes(r.status)
    )
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
}

/**
 * Get single request by ID
 */
export async function getRequestById(id: string): Promise<MentorClientRequest | null> {
  await delay(MOCK_DELAY)

  const session = getMentorSession()
  if (!session) throw new Error('Не авторизован')

  const request = requestsStore.find((r) => r.id === id && r.mentorId === session.mentorId)
  return request || null
}

/**
 * Update request status
 */
export async function updateRequestStatus(
  id: string,
  newStatus: RequestStatus
): Promise<MentorClientRequest> {
  await delay(MOCK_DELAY)

  const session = getMentorSession()
  if (!session) throw new Error('Не авторизован')

  const index = requestsStore.findIndex((r) => r.id === id && r.mentorId === session.mentorId)
  if (index === -1) throw new Error('Заявка не найдена')

  const request = requestsStore[index]

  // Update the request
  const updatedRequest: MentorClientRequest = {
    ...request,
    status: newStatus,
    modifiedAt: new Date().toISOString(),
    statusChangedAt: new Date().toISOString(),
  }

  requestsStore[index] = updatedRequest

  return updatedRequest
}

/**
 * Decline request with reason
 */
export async function declineRequest(
  id: string,
  payload: DeclineRequestPayload
): Promise<MentorClientRequest> {
  await delay(MOCK_DELAY)

  const session = getMentorSession()
  if (!session) throw new Error('Не авторизован')

  const index = requestsStore.findIndex((r) => r.id === id && r.mentorId === session.mentorId)
  if (index === -1) throw new Error('Заявка не найдена')

  const request = requestsStore[index]

  // Cannot decline if already done
  if (request.status === 'done') {
    throw new Error('Нельзя отклонить завершённую заявку')
  }

  console.info(
    `[MOCK] Declining request ${id} with reason: ${payload.reason}, comment: ${
      payload.comment || 'none'
    }`
  )

  const updatedRequest: MentorClientRequest = {
    ...request,
    status: 'declined',
    modifiedAt: new Date().toISOString(),
    statusChangedAt: new Date().toISOString(),
  }

  requestsStore[index] = updatedRequest

  return updatedRequest
}

/**
 * Reset mock data (for testing)
 */
export function resetMockData(): void {
  requestsStore = [...MOCK_REQUESTS]
}
