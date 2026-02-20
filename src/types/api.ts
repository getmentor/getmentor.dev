/**
 * API request/response types for Go API client
 */

import type { NextApiRequest, NextApiResponse } from 'next'

/**
 * Parameters for fetching all mentors
 */
export interface GetAllMentorsParams {
  onlyVisible?: boolean
  drop_long_fields?: boolean
}

/**
 * Parameters for fetching a single mentor
 */
export interface GetOneMentorParams {
  showHiddenFields?: boolean
}

/**
 * Contact mentor form request
 */
export interface ContactMentorRequest {
  mentorId: string
  name: string
  email: string
  telegramUsername: string
  experience?: string
  intro: string
  recaptchaToken: string
}

/**
 * Contact mentor response
 */
export interface ContactMentorResponse {
  success: boolean
  message?: string
}

/**
 * Save profile request
 */
export interface SaveProfileRequest {
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
 * Save profile response
 */
export interface SaveProfileResponse {
  success: boolean
  message?: string
}

/**
 * Upload profile picture request
 */
export interface UploadProfilePictureRequest {
  image: string // base64 encoded
  fileName: string
  contentType: string
}

/**
 * Upload profile picture response
 */
export interface UploadProfilePictureResponse {
  success: boolean
  imageUrl?: string
  message?: string
}

/**
 * Profile picture data for registration
 */
export interface ProfilePictureData {
  image: string // base64 encoded
  fileName: string
  contentType: string // 'image/jpeg' | 'image/png' | 'image/webp'
}

/**
 * Register mentor request
 */
export interface RegisterMentorRequest {
  name: string
  email: string
  telegram: string
  job: string
  workplace: string
  experience: string // '2-5' | '5-10' | '10+'
  price: string
  tags: string[]
  about: string
  description: string
  competencies: string
  calendarUrl?: string
  profilePicture: ProfilePictureData
  recaptchaToken: string
}

/**
 * Register mentor response
 */
export interface RegisterMentorResponse {
  success: boolean
  message?: string
  mentorId?: number
  error?: string
}

/**
 * HTTP Error class with status code
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

/**
 * API route handler type
 */
export type ApiHandler<T = unknown> = (
  req: NextApiRequest,
  res: NextApiResponse<T>
) => Promise<void> | void

/**
 * Standard API error response
 */
export interface ApiErrorResponse {
  error: string
  message?: string
}

/**
 * Go API internal request body
 */
export interface GoApiInternalRequest {
  only_visible?: boolean
  drop_long_fields?: boolean
  show_hidden?: boolean
}

/**
 * Request options for Go API client
 */
export interface GoApiRequestOptions {
  headers?: Record<string, string>
  body?: Record<string, unknown>
}
