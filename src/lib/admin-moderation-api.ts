import type {
  AdminSession,
  MentorModerationFilter,
  AdminMentorListItem,
  AdminMentorDetails,
  AdminMentorProfileUpdateRequest,
  AdminStatusUpdateRequest,
  UploadProfilePictureRequest,
  UploadProfilePictureResponse,
} from '@/types'

export class ApiError extends Error {
  constructor(message: string, public status: number, public details?: unknown) {
    super(message)
    this.name = 'ApiError'
  }
}

async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(endpoint, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })

  if (!response.ok) {
    let errorMessage = 'Произошла ошибка'
    let errorDetails: unknown

    try {
      const errorData = await response.json()
      errorMessage = errorData.error || errorData.message || errorMessage
      errorDetails = errorData.details
    } catch {
      // ignore parse errors
    }

    throw new ApiError(errorMessage, response.status, errorDetails)
  }

  const contentType = response.headers.get('content-type')
  if (!contentType || !contentType.includes('application/json')) {
    return {} as T
  }

  return response.json()
}

let cachedSession: AdminSession | null = null

export async function getAdminSession(): Promise<AdminSession | null> {
  if (cachedSession && cachedSession.exp * 1000 > Date.now()) {
    return cachedSession
  }

  try {
    const response = await apiRequest<{ success: boolean; session?: AdminSession }>(
      '/api/admin/auth/session'
    )
    if (response.success && response.session) {
      cachedSession = response.session
      return response.session
    }
    return null
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      cachedSession = null
      return null
    }
    throw error
  }
}

export function clearAdminSession(): void {
  cachedSession = null
}

export async function requestAdminLogin(
  email: string
): Promise<{ success: boolean; message?: string }> {
  const genericSuccessMessage =
    'Если ваш email зарегистрирован в системе, вы получите ссылку для входа'

  try {
    await apiRequest<{ success: boolean; message?: string }>('/api/admin/auth/request-login', {
      method: 'POST',
      body: JSON.stringify({ email }),
    })
    return { success: true, message: genericSuccessMessage }
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return {
        success: false,
        message: 'Не удалось подключиться к серверу. Проверьте соединение.',
      }
    }
    return { success: true, message: genericSuccessMessage }
  }
}

export async function verifyAdminLogin(
  token: string
): Promise<{ success: boolean; session?: AdminSession; message?: string }> {
  try {
    const response = await apiRequest<{ success: boolean; session?: AdminSession; error?: string }>(
      '/api/admin/auth/verify',
      {
        method: 'POST',
        body: JSON.stringify({ token }),
      }
    )

    if (response.success && response.session) {
      cachedSession = response.session
      return { success: true, session: response.session }
    }

    return { success: false, message: response.error || 'Не удалось выполнить вход' }
  } catch (error) {
    if (error instanceof ApiError) {
      return { success: false, message: error.message }
    }
    return { success: false, message: 'Недействительный или просроченный токен' }
  }
}

export async function logoutAdmin(): Promise<void> {
  try {
    await apiRequest<{ success: boolean }>('/api/admin/auth/logout', { method: 'POST' })
  } finally {
    cachedSession = null
  }
}

export async function getModerationMentors(
  status: MentorModerationFilter
): Promise<AdminMentorListItem[]> {
  const response = await apiRequest<{ mentors: AdminMentorListItem[]; total: number }>(
    `/api/admin/mentors?status=${status}`
  )
  return response.mentors
}

export async function getModerationMentorById(
  mentorId: string
): Promise<AdminMentorDetails | null> {
  try {
    const response = await apiRequest<{ mentor: AdminMentorDetails }>(
      `/api/admin/mentors/${encodeURIComponent(mentorId)}`
    )
    return response.mentor
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return null
    }
    throw error
  }
}

export async function updateModerationMentor(
  mentorId: string,
  payload: AdminMentorProfileUpdateRequest
): Promise<AdminMentorDetails> {
  const response = await apiRequest<{ mentor: AdminMentorDetails }>(
    `/api/admin/mentors/${encodeURIComponent(mentorId)}`,
    {
      method: 'POST',
      body: JSON.stringify(payload),
    }
  )
  return response.mentor
}

export async function approveModerationMentor(mentorId: string): Promise<AdminMentorDetails> {
  const response = await apiRequest<{ mentor: AdminMentorDetails }>(
    `/api/admin/mentors/${encodeURIComponent(mentorId)}/approve`,
    { method: 'POST' }
  )
  return response.mentor
}

export async function declineModerationMentor(mentorId: string): Promise<AdminMentorDetails> {
  const response = await apiRequest<{ mentor: AdminMentorDetails }>(
    `/api/admin/mentors/${encodeURIComponent(mentorId)}/decline`,
    { method: 'POST' }
  )
  return response.mentor
}

export async function updateModerationMentorStatus(
  mentorId: string,
  payload: AdminStatusUpdateRequest
): Promise<AdminMentorDetails> {
  const response = await apiRequest<{ mentor: AdminMentorDetails }>(
    `/api/admin/mentors/${encodeURIComponent(mentorId)}/status`,
    {
      method: 'POST',
      body: JSON.stringify(payload),
    }
  )
  return response.mentor
}

export async function uploadModerationMentorPicture(
  mentorId: string,
  imageData: UploadProfilePictureRequest
): Promise<UploadProfilePictureResponse> {
  return apiRequest<UploadProfilePictureResponse>(
    `/api/admin/mentors/${encodeURIComponent(mentorId)}/picture`,
    {
      method: 'POST',
      body: JSON.stringify(imageData),
    }
  )
}
