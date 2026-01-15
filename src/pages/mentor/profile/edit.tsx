/**
 * Mentor Profile Edit Page
 *
 * Allows mentors to edit their profile using session-based auth.
 */

import { useState, useEffect, Fragment } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { Transition } from '@headlessui/react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleNotch } from '@fortawesome/free-solid-svg-icons'
import type {
  MentorWithSecureFields,
  SaveProfileRequest,
  UploadProfilePictureRequest,
} from '@/types'
import { hasMentorSecureFields } from '@/types'
import { MentorAuthProvider, useMentorAuth, MentorAdminLayout } from '@/components/mentor-admin'
import { ProfileForm, Notification } from '@/components'
import { useRouter } from 'next/router'

type ReadyStatus = '' | 'loading' | 'success' | 'error'
type ImageUploadStatus = 'idle' | 'loading' | 'success' | 'error'

function ProfileEditContent(): JSX.Element {
  const router = useRouter()
  const { isAuthenticated, isLoading: authLoading, session } = useMentorAuth()
  const [mentor, setMentor] = useState<MentorWithSecureFields | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [readyStatus, setReadyStatus] = useState<ReadyStatus>('')
  const [showSuccess, setShowSuccess] = useState(false)
  const [imageUploadStatus, setImageUploadStatus] = useState<ImageUploadStatus>('idle')
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null)
  const [tempImagePreview, setTempImagePreview] = useState<string | null>(null)

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace('/mentor/login')
    }
  }, [authLoading, isAuthenticated, router])

  // Load mentor profile
  useEffect(() => {
    if (!isAuthenticated || !session) return

    const loadMentor = async (): Promise<void> => {
      try {
        setIsLoading(true)
        setError(null)
        const response = await fetch('/api/mentor/profile', {
          credentials: 'include',
        })
        if (!response.ok) {
          throw new Error('Failed to load profile')
        }
        const data = await response.json()
        if (data.mentor && hasMentorSecureFields(data.mentor)) {
          setMentor(data.mentor)
        } else {
          setError('Profile not found')
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load profile')
      } finally {
        setIsLoading(false)
      }
    }

    loadMentor()
  }, [isAuthenticated, session])

  // Show success notification
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined
    if (readyStatus === 'success') {
      setShowSuccess(true)
      timer = setTimeout(() => setShowSuccess(false), 3000)
    }
    return () => {
      if (timer) {
        clearTimeout(timer)
      }
    }
  }, [readyStatus])

  const onSubmit = async (data: SaveProfileRequest): Promise<void> => {
    if (readyStatus === 'loading' || !mentor) return

    setReadyStatus('loading')

    try {
      const response = await fetch('/api/mentor/profile', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error('Failed to save profile')
      }

      const result = await response.json()
      setReadyStatus(result.success ? 'success' : 'error')
    } catch (e) {
      setReadyStatus('error')
      console.error('Profile save error:', e)
    }
  }

  const onImageUpload = async (
    imageData: UploadProfilePictureRequest,
    onSuccess?: () => void
  ): Promise<void> => {
    if (imageUploadStatus === 'loading' || !mentor) return

    setImageUploadStatus('loading')
    setTempImagePreview(imageData.image)

    try {
      const response = await fetch('/api/mentor/profile/picture', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(imageData),
      })

      if (!response.ok) {
        throw new Error('Failed to upload image')
      }

      const data = await response.json()
      if (data.success) {
        setImageUploadStatus('success')
        if (data.imageUrl) {
          setUploadedImageUrl(data.imageUrl)
        }
        if (onSuccess) {
          onSuccess()
        }
        setTimeout(() => setImageUploadStatus('idle'), 5000)
      } else {
        setImageUploadStatus('error')
        setTempImagePreview(null)
      }
    } catch (e) {
      setImageUploadStatus('error')
      setTempImagePreview(null)
      console.error('Profile picture upload error:', e)
    }
  }

  // Show loading while checking auth
  if (authLoading || !isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <FontAwesomeIcon icon={faCircleNotch} className="animate-spin text-indigo-500 text-2xl" />
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>Редактировать профиль — getmentor.dev</title>
      </Head>

      <MentorAdminLayout title="Редактировать профиль">
        {/* Loading state */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-12">
            <FontAwesomeIcon
              icon={faCircleNotch}
              className="animate-spin text-indigo-500 text-2xl mb-3"
            />
            <p className="text-gray-500">Загрузка профиля...</p>
          </div>
        )}

        {/* Error state */}
        {error && !isLoading && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-800 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="text-sm text-red-600 hover:text-red-700 underline"
            >
              Попробовать снова
            </button>
          </div>
        )}

        {/* Profile form */}
        {!isLoading && !error && mentor && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="mb-6">
              <Link
                href={'/mentor/' + mentor.slug}
                className="text-sm text-indigo-600 hover:text-indigo-500"
                target="_blank"
              >
                Открыть личную страницу →
              </Link>
            </div>

            <ProfileForm
              mentor={{
                ...mentor,
                photo_url: uploadedImageUrl || mentor.photo_url,
              }}
              isLoading={readyStatus === 'loading'}
              isError={readyStatus === 'error'}
              onSubmit={onSubmit}
              onImageUpload={onImageUpload}
              imageUploadStatus={imageUploadStatus}
              tempImagePreview={tempImagePreview}
            />
          </div>
        )}

        {/* Success notification */}
        <div
          aria-live="assertive"
          className="fixed z-10 inset-0 flex items-end px-4 py-6 pointer-events-none sm:p-6"
        >
          <div className="w-full flex flex-col items-center space-y-4 sm:items-end">
            <Transition
              show={showSuccess}
              as={Fragment}
              enter="transform ease-out duration-300 transition"
              enterFrom="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
              enterTo="translate-y-0 opacity-100 sm:translate-x-0"
              leave="transition ease-in duration-100"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Notification
                content="Данные успешно сохранены"
                onClose={() => setShowSuccess(false)}
              />
            </Transition>
          </div>
        </div>
      </MentorAdminLayout>
    </>
  )
}

export default function MentorProfileEditPage(): JSX.Element {
  return (
    <MentorAuthProvider>
      <ProfileEditContent />
    </MentorAuthProvider>
  )
}
