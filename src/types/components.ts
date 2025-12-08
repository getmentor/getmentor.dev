/**
 * Component prop types
 */

import type { ReactNode } from 'react'
import type { MentorBase, MentorWithSecureFields, MentorListItem } from './mentor'
import type { AppliedFilters, FilterTheme } from './filters'

/**
 * Common component prop types
 */
export interface ChildrenProps {
  children: ReactNode
}

export interface ClassNameProps {
  className?: string
}

/**
 * Section component props
 */
export interface SectionProps extends ChildrenProps, ClassNameProps {
  id?: string
}

export interface SectionTitleProps extends ChildrenProps, ClassNameProps {}

/**
 * MentorsList component props
 */
export interface MentorsListProps {
  mentors: MentorListItem[]
  hasMore: boolean
  onClickMore: () => void
}

/**
 * MentorsFilters component props
 */
export interface MentorsFiltersProps {
  appliedFilters: AppliedFilters
  allowSponsors?: boolean
  tags?: string[]
  experiences?: string[]
}

/**
 * MentorsSearch component props
 */
export interface MentorsSearchProps {
  value: string
  onChange: (value: string) => void
}

/**
 * Image upload data
 */
export interface ImageUploadData {
  image: string
  fileName: string
  contentType: string
}

/**
 * Profile form data
 */
export interface ProfileFormData {
  name: string
  job: string
  workplace: string
  experience: string
  price: string
  tags: string[]
  about: string
  description: string
  competencies: string
  calendarUrl?: string
}

/**
 * Image upload status
 */
export type ImageUploadStatus = '' | 'loading' | 'success' | 'error'

/**
 * ProfileForm component props
 */
export interface ProfileFormProps {
  mentor: MentorWithSecureFields
  isLoading: boolean
  isError: boolean
  onSubmit: (data: ProfileFormData) => void
  onImageUpload: (imageData: ImageUploadData, onSuccess: () => void) => void
  imageUploadStatus: ImageUploadStatus
  tempImagePreview: string | null
}

/**
 * ContactMentorForm component props
 */
export interface ContactMentorFormProps {
  mentor: MentorBase
  onSuccess?: () => void
}

/**
 * Contact form data
 */
export interface ContactFormData {
  email: string
  name: string
  intro: string
  telegram?: string
}

/**
 * FilterGroupDropdown component props
 */
export interface FilterGroupDropdownProps {
  title: string
  values: string[]
  onFilterSelect: (value: string) => void
  allSelectedValues: string[] | string | undefined
  multiSelect?: boolean
  theme?: FilterTheme
}

/**
 * Notification component props
 */
export interface NotificationProps {
  content: string
  onClose: () => void
}

/**
 * MetaHeader component props
 */
export interface MetaHeaderProps {
  customTitle?: string
  customDescription?: string
  customImage?: string | null
}

/**
 * Wysiwyg editor instance
 */
export interface WysiwygEditor {
  getHTML: () => string
}

/**
 * Wysiwyg component props
 */
export interface WysiwygProps {
  content: string
  onUpdate: (editor: WysiwygEditor) => void
}

/**
 * Koalendar component props
 */
export interface KoalendarProps {
  url: string
}

/**
 * CalendlabWidget component props
 */
export interface CalendlabWidgetProps {
  url: string
}

/**
 * HtmlContent component props
 */
export interface HtmlContentProps {
  content: string | null | undefined
  className?: string
}

/**
 * Nav header props
 */
export interface NavHeaderProps {
  transparent?: boolean
}
