/**
 * Types for Mentor Admin - Client Requests
 */

/**
 * Request status as defined in the spec
 */
export type RequestStatus =
  | 'pending'
  | 'contacted'
  | 'working'
  | 'done'
  | 'declined'
  | 'unavailable'

/**
 * Active statuses - displayed on /mentor page
 */
export const ACTIVE_STATUSES: RequestStatus[] = ['pending', 'contacted', 'working']

/**
 * Past statuses - displayed on /mentor/past page
 */
export const PAST_STATUSES: RequestStatus[] = ['done', 'declined', 'unavailable']

/**
 * Status workflow - valid transitions
 * - pending → contacted → working → done
 * - declined allowed from any state except done
 */
export const STATUS_TRANSITIONS: Record<RequestStatus, RequestStatus[]> = {
  pending: ['contacted', 'declined'],
  contacted: ['working', 'declined'],
  working: ['done', 'declined'],
  done: [], // terminal state
  declined: [], // terminal state
  unavailable: [], // terminal state
}

/**
 * Status display labels in Russian
 */
export const STATUS_LABELS: Record<RequestStatus, string> = {
  pending: 'Ожидает',
  contacted: 'Связались',
  working: 'В работе',
  done: 'Завершено',
  declined: 'Отклонено',
  unavailable: 'Недоступен',
}

/**
 * Status badge colors (Tailwind classes)
 */
export const STATUS_COLORS: Record<RequestStatus, { bg: string; text: string }> = {
  pending: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
  contacted: { bg: 'bg-blue-100', text: 'text-blue-800' },
  working: { bg: 'bg-indigo-100', text: 'text-indigo-800' },
  done: { bg: 'bg-green-100', text: 'text-green-800' },
  declined: { bg: 'bg-red-100', text: 'text-red-800' },
  unavailable: { bg: 'bg-gray-100', text: 'text-gray-800' },
}

/**
 * Predefined decline reasons
 */
export const DECLINE_REASONS = [
  { value: 'no_time', label: 'Нет времени' },
  { value: 'topic_mismatch', label: 'Тема не соответствует моей экспертизе' },
  { value: 'helping_others', label: 'Уже помогаю другим менти' },
  { value: 'on_break', label: 'Временно не принимаю заявки' },
  { value: 'other', label: 'Другая причина' },
] as const

export type DeclineReasonValue = (typeof DECLINE_REASONS)[number]['value']

/**
 * Client request from a mentee
 */
export interface MentorClientRequest {
  id: string
  email: string
  name: string
  telegram: string
  details: string
  level: string
  createdAt: string // ISO date string
  modifiedAt: string // ISO date string
  statusChangedAt: string // ISO date string
  scheduledAt: string | null // ISO date string or null
  review: string | null
  status: RequestStatus
  mentorId: string
  reviewUrl: string | null
}

/**
 * Decline request payload
 */
export interface DeclineRequestPayload {
  reason: DeclineReasonValue
  comment?: string
}

/**
 * Update status payload
 */
export interface UpdateStatusPayload {
  status: RequestStatus
}

/**
 * API response for requests list
 */
export interface RequestsListResponse {
  requests: MentorClientRequest[]
  total: number
}

/**
 * Mentor session data (from auth)
 */
export interface MentorSession {
  mentorId: string
  email: string
  name: string
  expiresAt: string // ISO date string
}

/**
 * Auth request payload
 */
export interface RequestLoginPayload {
  email: string
}

/**
 * Auth verify payload
 */
export interface VerifyLoginPayload {
  token: string
}

/**
 * Auth response
 */
export interface AuthResponse {
  success: boolean
  message?: string
  session?: MentorSession
}
