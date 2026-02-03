/**
 * Mentor domain types
 */

/**
 * Calendar integration types
 */
export type CalendarType = 'calendly' | 'koalendar' | 'calendlab' | 'url' | 'none'

/**
 * Experience level types
 */
export type ExperienceLevel = '2-5' | '5-10' | '10+'

/**
 * Price options (Russian currency)
 */
export type Price =
  | 'Бесплатно'
  | '1000 руб'
  | '2000 руб'
  | '3000 руб'
  | '4000 руб'
  | '5000 руб'
  | '6000 руб'
  | '7000 руб'
  | '8000 руб'
  | '9000 руб'
  | '10000 руб'
  | '12000 руб'
  | '15000 руб'
  | 'По договоренности'

/**
 * Mentor tag categories
 */
export type MentorTag =
  | 'Backend'
  | 'Frontend'
  | 'Code Review'
  | 'System Design'
  | 'UX/UI/Design'
  | 'iOS'
  | 'Android'
  | 'QA'
  | 'Marketing'
  | 'Content/Copy'
  | 'Databases'
  | 'Data Science/ML'
  | 'Аналитика'
  | 'Сети'
  | 'Cloud'
  | 'Безопасность'
  | 'DevOps/SRE'
  | 'Agile'
  | 'Team Lead/Management'
  | 'Project Management'
  | 'Product Management'
  | 'Entrepreneurship'
  | 'DevRel'
  | 'HR'
  | 'Карьера'
  | 'Собеседования'
  | 'Другое'

/**
 * Sponsor tags
 */
export type SponsorTag = 'Эксперт Авито' | 'Сообщество Онтико'

/**
 * Combined tag type
 */
export type Tag = MentorTag | SponsorTag

/**
 * Base mentor data (public fields)
 */
export interface MentorBase {
  id: number
  mentorId: string
  slug: string
  name: string
  job: string
  workplace: string
  description: string | null
  about: string | null
  competencies: string
  experience: ExperienceLevel | string
  price: Price | string
  tags: string[]
  menteeCount: number
  photo_url: string | null
  sortOrder: number
  isVisible: boolean
  isNew: boolean
  calendarType: CalendarType
  sponsors?: string[]
}

/**
 * Mentor with hidden/secure fields (for authenticated access)
 */
export interface MentorWithSecureFields extends MentorBase {
  calendarUrl: string | null
}

/**
 * Mentor type for list view (with potentially dropped long fields)
 */
export interface MentorListItem extends Omit<MentorBase, 'description' | 'about'> {
  description?: string | null
  about?: string | null
}

/**
 * Type guard for mentor with secure fields
 */
export function hasMentorSecureFields(
  mentor: MentorBase | MentorWithSecureFields
): mentor is MentorWithSecureFields {
  return 'calendarUrl' in mentor
}
