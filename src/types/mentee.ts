/**
 * Types for the mentee dashboard (read-only list of a mentee's requests)
 */

export type MenteeRequestGroup = 'pending' | 'active' | 'done' | 'closed'

/** Raw client_requests.status values a mentee can see */
export type MenteeRequestStatus =
  | 'pending'
  | 'contacted'
  | 'working'
  | 'reschedule'
  | 'done'
  | 'declined'
  | 'unavailable'

export interface MenteeSession {
  mentee_id: string
  exp: number
  iat: number
}

/** What a mentee may see about a mentor: never email or messenger handles */
export interface MenteeDashboardMentor {
  name: string
  /** Only while the mentor's profile is publicly visible */
  slug: string | null
  /** Only for pending/active requests */
  calendarUrl: string | null
}

export interface MenteeDashboardReview {
  mentorReview: string
  platformReview: string
  improvements: string
  createdAt: string | null
}

export interface MenteeDashboardRequest {
  /** Capability for legacy review links: keep in memory only, never in URLs/DOM/analytics */
  id: string
  status: MenteeRequestStatus
  group: MenteeRequestGroup
  details: string
  createdAt: string
  statusChangedAt: string | null
  declineReason: string | null
  declineComment: string | null
  /** null when the mentor deleted their profile */
  mentor: MenteeDashboardMentor | null
  canReview: boolean
  review: MenteeDashboardReview | null
}

export interface MenteeRequestsResponse {
  requests: MenteeDashboardRequest[]
}

export interface MenteeReviewPayload {
  mentorReview: string
  platformReview: string
  improvements: string
  recaptchaToken: string
}

export const MENTEE_GROUP_ORDER: MenteeRequestGroup[] = ['pending', 'active', 'done', 'closed']

export const MENTEE_GROUP_LABELS: Record<MenteeRequestGroup, string> = {
  pending: 'Ожидают ответа',
  active: 'В работе',
  done: 'Завершены',
  closed: 'Закрыты',
}

export const MENTEE_STATUS_LABELS: Record<MenteeRequestStatus, string> = {
  pending: 'Ожидает ответа ментора',
  contacted: 'Ментор связался с вами',
  working: 'В работе',
  reschedule: 'Встреча переносится',
  done: 'Завершена',
  declined: 'Отклонена',
  unavailable: 'Ментор недоступен',
}

export const MENTEE_DECLINE_REASON_LABELS: Record<string, string> = {
  no_time: 'Нет времени',
  topic_mismatch: 'Тема не соответствует экспертизе ментора',
  helping_others: 'Ментор уже помогает другим',
  on_break: 'Ментор временно не принимает заявки',
  other: 'Другая причина',
}
