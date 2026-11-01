import type { RequestStatus } from './mentor-requests'

export const ADMIN_REQUEST_STATUSES: RequestStatus[] = [
  'pending',
  'contacted',
  'working',
  'done',
  'declined',
  'unavailable',
]

/** Statuses treated as "closed" in the admin UI */
export const ADMIN_CLOSED_REQUEST_STATUSES: RequestStatus[] = ['done', 'declined', 'unavailable']

export const ADMIN_REQUEST_STATUS_LABELS: Record<RequestStatus, string> = {
  pending: 'Pending',
  contacted: 'Contacted',
  working: 'Working',
  done: 'Done',
  declined: 'Declined',
  unavailable: 'Unavailable',
}

export interface AdminRequestMentor {
  mentorId: string
  id: number
  slug: string
  name: string
  email: string
}

export interface AdminRequestListItem {
  id: string
  name: string
  email: string
  telegram: string
  status: RequestStatus
  createdAt: string
  hasReview: boolean
  mentor: AdminRequestMentor | null
}

export interface AdminRequestReview {
  id: string
  mentorReview: string
  platformReview: string
  improvements: string
  createdAt: string
}

export interface AdminRequestDetails {
  id: string
  name: string
  email: string
  telegram: string
  details: string
  level: string
  status: RequestStatus
  createdAt: string
  modifiedAt: string
  statusChangedAt: string | null
  scheduledAt: string | null
  declineReason: string
  declineComment: string
  mentor: AdminRequestMentor | null
  review: AdminRequestReview | null
}

export interface AdminRequestsListResponse {
  requests: AdminRequestListItem[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface AdminRequestResponse {
  request: AdminRequestDetails
}

/** Filters and pagination for the admin requests list. Empty values are ignored. */
export interface AdminRequestsQuery {
  page?: number
  pageSize?: number
  mentorId?: string
  mentorEmail?: string
  mentorName?: string
  menteeEmail?: string
  status?: RequestStatus | ''
}

export const ADMIN_REQUESTS_QUERY_KEYS = [
  'page',
  'pageSize',
  'mentorId',
  'mentorEmail',
  'mentorName',
  'menteeEmail',
  'status',
] as const

/** Build a URL query string from admin requests filters, skipping empty values. */
export function buildAdminRequestsQueryString(query: AdminRequestsQuery): string {
  const params = new URLSearchParams()
  for (const key of ADMIN_REQUESTS_QUERY_KEYS) {
    const value = query[key]
    if (value === undefined || value === null) continue
    const str = String(value).trim()
    if (str !== '') params.set(key, str)
  }
  return params.toString()
}

export interface AdminRequestStatusUpdateRequest {
  status: RequestStatus
}
