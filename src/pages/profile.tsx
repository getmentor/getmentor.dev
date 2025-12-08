import { useEffect, useState, Fragment } from 'react'
import { Transition } from '@headlessui/react'
import Head from 'next/head'
import NextError from 'next/error'
import Link from 'next/link'
import type { GetServerSideProps, InferGetServerSidePropsType } from 'next'
import { Footer, NavHeader, Notification, ProfileForm, Section } from '@/components'
import { getOneMentorById } from '@/server/mentors-data'
import seo from '@/config/seo'
import filters from '@/config/filters'
import analytics from '@/lib/analytics'
import { withSSRObservability } from '@/lib/with-ssr-observability'
import logger from '@/lib/logger'
import type {
  MentorWithSecureFields,
  SaveProfileRequest,
  UploadProfilePictureRequest,
} from '@/types'
import { hasMentorSecureFields } from '@/types'

interface ProfilePageProps {
  [key: string]: unknown
  errorCode: number
  mentor: MentorWithSecureFields | null
}

type ReadyStatus = '' | 'loading' | 'success' | 'error'
type ImageUploadStatus = 'idle' | 'loading' | 'success' | 'error'

interface AuthCredentials {
  id: string | null
  token: string | null
}

const _getServerSideProps: GetServerSideProps<ProfilePageProps> = async (context) => {
  const idParam = Array.isArray(context.query.id) ? context.query.id[0] : context.query.id
  const mentorId = parseInt(idParam || '', 10)
  if (Number.isNaN(mentorId)) {
    logger.warn('Invalid mentor ID for profile edit', { id: context.query.id })
    return { notFound: true }
  }

  const mentor = await getOneMentorById(mentorId, { showHiddenFields: true })

  if (!mentor || !hasMentorSecureFields(mentor)) {
    logger.warn('Mentor not found for profile edit', { id: context.query.id })
    return { notFound: true }
  }

  const tokenParam = Array.isArray(context.query.token) ? context.query.token[0] : context.query.token
  if (!tokenParam || mentor.authToken !== tokenParam) {
    logger.warn('Unauthorized profile edit attempt', {
      mentorId: context.query.id,
      hasToken: !!context.query.token,
    })
    return {
      props: { errorCode: 403, mentor: null },
    }
  }

  logger.info('Profile edit page rendered', {
    mentorId: mentor.id,
    mentorSlug: mentor.slug,
  })

  return {
    props: { errorCode: 0, mentor },
  }
}

export const getServerSideProps = withSSRObservability(_getServerSideProps, 'profile-edit')

export default function Profile({
  errorCode,
  mentor,
}: InferGetServerSidePropsType<typeof getServerSideProps>): JSX.Element {
  if (!mentor) {
    return <NextError statusCode={404} title="Mentor not found" />
  }

  // SECURITY: Extract auth credentials from URL once on page load, use in headers
  const [authCredentials, setAuthCredentials] = useState<AuthCredentials>({ id: null, token: null })

  useEffect(() => {
    // Get auth from URL query parameters (only on initial page load)
    const params = new URLSearchParams(window.location.search)
    const id = params.get('id')
    const token = params.get('token')

    if (id && token) {
      setAuthCredentials({ id, token })

      // SECURITY: Remove credentials from URL to prevent exposure
      // Keep them only in component state
      const newUrl = window.location.pathname
      window.history.replaceState({}, '', newUrl)
    }
  }, [])

  useEffect(() => {
    if (mentor) {
      analytics.event('Open Profile', {
        'Mentor Id': mentor.id,
        'Mentor Name': mentor.name,
        'Mentor Experience': mentor.experience,
        'Mentor Price': mentor.price,
      })
    }
  }, [mentor])

  const [readyStatus, setReadyStatus] = useState<ReadyStatus>('')
  const [showSuccess, setShowSuccess] = useState(false)
  const [imageUploadStatus, setImageUploadStatus] = useState<ImageUploadStatus>('idle')
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null)
  const [tempImagePreview, setTempImagePreview] = useState<string | null>(null)

  const title = 'Профиль | ' + seo.title

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

  const onSubmit = (data: SaveProfileRequest): void => {
    if (readyStatus === 'loading') {
      return
    }

    setReadyStatus('loading')

    analytics.event('Save Profile', {
      'Mentor Id': mentor.id,
      'Mentor Name': mentor.name,
      'Mentor Experience': mentor.experience,
      'Mentor Price': mentor.price,
    })

    // SECURITY: Call Next.js API route (proxy), which calls Go API on localhost
    // This keeps Go API private (localhost only), not exposed to public internet
    fetch('/api/save-profile', {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json',
        'X-Mentor-ID': authCredentials.id ?? '',
        'X-Auth-Token': authCredentials.token ?? '',
      },
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`)
        }
        return res.json() as Promise<{ success: boolean }>
      })
      .then((responseData) => {
        setReadyStatus(responseData.success ? 'success' : 'error')
      })
      .catch((e) => {
        setReadyStatus('error')
        // Client-side error - console.error is appropriate here
        console.error('Profile save error:', e)
      })
  }

  const onImageUpload = (
    imageData: UploadProfilePictureRequest,
    onSuccess?: () => void
  ): void => {
    if (imageUploadStatus === 'loading') {
      return
    }

    setImageUploadStatus('loading')
    // Show the uploaded image immediately and keep it until page refresh
    setTempImagePreview(imageData.image)

    analytics.event('Upload Profile Picture', {
      'Mentor Id': mentor.id,
      'Mentor Name': mentor.name,
    })

    // SECURITY: Call Next.js API route (proxy), which calls Go API on localhost
    // This keeps Go API private (localhost only), not exposed to public internet
    fetch('/api/upload-profile-picture', {
      method: 'POST',
      body: JSON.stringify(imageData),
      headers: {
        'Content-Type': 'application/json',
        'X-Mentor-ID': authCredentials.id ?? '',
        'X-Auth-Token': authCredentials.token ?? '',
      },
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`)
        }
        return res.json() as Promise<{ success: boolean; imageUrl?: string }>
      })
      .then((data) => {
        if (data.success) {
          setImageUploadStatus('success')
          // Store the new image URL to display it immediately
          if (data.imageUrl) {
            setUploadedImageUrl(data.imageUrl)
          }
          // Call the success callback to reset the form
          if (onSuccess) {
            onSuccess()
          }
          // Reset status after 5 seconds
          setTimeout(() => setImageUploadStatus('idle'), 5000)
        } else {
          setImageUploadStatus('error')
          setTempImagePreview(null)
        }
      })
      .catch((e) => {
        setImageUploadStatus('error')
        setTempImagePreview(null)
        // Client-side error - console.error is appropriate here
        console.error('Profile picture upload error:', e)
      })
  }

  if (errorCode) {
    return <NextError statusCode={403} title="Access denied" />
  }

  return (
    <>
      <Head>
        <title>{title}</title>
      </Head>

      <NavHeader />

      <Section>
        <div className="text-center">
          <h1 className="mb-6">Профиль</h1>
          <Link href={'/mentor/' + mentor.slug} className="link text-sm" target="_blank">
            Открыть личную страницу
          </Link>
        </div>
      </Section>

      <Section>
        <div className="max-w-screen-md mx-auto">
          <ProfileForm
            mentor={{
              ...mentor,
              tags: mentor.tags.filter((tag) => !filters.sponsors.includes(tag)),
              // Use the newly uploaded image URL if available
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
      </Section>

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

      <Footer />
    </>
  )
}
