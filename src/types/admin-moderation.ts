export type ModeratorRole = 'moderator' | 'admin'

export type MentorModerationFilter = 'pending' | 'approved' | 'declined'

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
