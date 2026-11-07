export type ModeratorRole = 'moderator' | 'admin'

/** Admin mentor list tabs; the API route accepts exactly these */
export const MENTOR_MODERATION_FILTERS = ['pending', 'approved', 'declined', 'deleted'] as const

export type MentorModerationFilter = (typeof MENTOR_MODERATION_FILTERS)[number]

export function isMentorModerationFilter(value: unknown): value is MentorModerationFilter {
  return (
    typeof value === 'string' && (MENTOR_MODERATION_FILTERS as readonly string[]).includes(value)
  )
}

export type MentorModerationStatus = 'pending' | 'active' | 'inactive' | 'declined'

export interface AdminSession {
  moderatorId: string
  email: string
  name: string
  role: ModeratorRole
  exp: number
  iat: number
}

export interface AdminMentorListItem {
  mentorId: string
  id: number
  name: string
  email: string
  telegram: string
  job: string
  workplace: string
  price: string
  status: MentorModerationStatus
  createdAt: string
  /** Set when the mentor profile is soft-deleted */
  deletedAt: string | null
}

export interface AdminMentorDetails {
  mentorId: string
  id: number
  slug: string
  name: string
  email: string
  telegram: string
  job: string
  workplace: string
  experience: string
  price: string
  tags: string[]
  about: string
  description: string
  competencies: string
  calendarUrl: string
  status: MentorModerationStatus
  sortOrder: number
  telegramChatId: number | null
  createdAt: string
  updatedAt: string
  /** Set when the mentor profile is soft-deleted */
  deletedAt: string | null
}

export interface AdminMentorsListResponse {
  mentors: AdminMentorListItem[]
  total: number
}

export interface AdminMentorResponse {
  mentor: AdminMentorDetails
}

export interface AdminMentorProfileUpdateRequest {
  name: string
  email: string
  telegram: string
  job: string
  workplace: string
  experience: string
  price: string
  tags: string[]
  about: string
  description: string
  competencies: string
  calendarUrl: string
  slug?: string
  telegramChatId?: string
}

export interface AdminStatusUpdateRequest {
  status: 'active' | 'inactive'
}

/** Confirms a profile delete by repeating the mentor's current slug */
export interface MentorDeleteRequest {
  slug: string
}

/** Details of the 409 returned when a restore is blocked by another profile with the same email */
export interface AdminMentorEmailConflict {
  code: 'email_conflict'
  mentorId: string
  name: string
  slug: string
  status: MentorModerationStatus
}

export function isAdminMentorEmailConflict(value: unknown): value is AdminMentorEmailConflict {
  if (!value || typeof value !== 'object') return false
  const v = value as Record<string, unknown>
  return v.code === 'email_conflict' && typeof v.mentorId === 'string'
}
