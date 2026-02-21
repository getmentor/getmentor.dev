import { useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/router'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleNotch } from '@fortawesome/free-solid-svg-icons'
import { AdminAuthProvider, AdminLayout, useAdminAuth } from '@/components/admin-moderation'
import Wysiwyg from '@/components/forms/Wysiwyg'
import filters from '@/config/filters'
import type {
  AdminMentorDetails,
  AdminMentorProfileUpdateRequest,
  UploadProfilePictureRequest,
} from '@/types'
import {
  getModerationMentorById,
  updateModerationMentor,
  approveModerationMentor,
  declineModerationMentor,
  updateModerationMentorStatus,
  uploadModerationMentorPicture,
} from '@/lib/admin-moderation-api'
import { imageLoader } from '@/lib/azure-image-loader'

type SaveState = 'idle' | 'loading' | 'success' | 'error'
type PictureState = 'idle' | 'loading' | 'success' | 'error'

function statusBadge(status: AdminMentorDetails['status']): string {
  if (status === 'active') return 'bg-green-100 text-green-800'
  if (status === 'inactive') return 'bg-gray-200 text-gray-800'
  if (status === 'declined') return 'bg-red-100 text-red-800'
  return 'bg-yellow-100 text-yellow-800'
}

function getBackLink(status: AdminMentorDetails['status']): string {
  if (status === 'pending') return '/admin/mentors/pending'
  if (status === 'declined') return '/admin/mentors/declined'
  return '/admin/mentors/approved'
}

function buildFormData(
  mentor: AdminMentorDetails,
  isAdmin: boolean
): AdminMentorProfileUpdateRequest {
  return {
    name: mentor.name,
    email: mentor.email,
    telegram: mentor.telegram,
    job: mentor.job,
    workplace: mentor.workplace,
    experience: mentor.experience,
    price: mentor.price,
    tags: mentor.tags,
    about: mentor.about,
    description: mentor.description,
    competencies: mentor.competencies,
    calendarUrl: mentor.calendarUrl || '',
    ...(isAdmin
      ? {
          slug: mentor.slug,
          telegramChatId: mentor.telegramChatId !== null ? String(mentor.telegramChatId) : '',
        }
      : {}),
  }
}

function MentorModerationEditContent(): JSX.Element {
  const router = useRouter()
  const { id } = router.query
  const mentorId = Array.isArray(id) ? id[0] : id
  const { isAuthenticated, isLoading: authLoading, session } = useAdminAuth()

  const [mentor, setMentor] = useState<AdminMentorDetails | null>(null)
  const [formData, setFormData] = useState<AdminMentorProfileUpdateRequest | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saveState, setSaveState] = useState<SaveState>('idle')
  const [actionError, setActionError] = useState<string | null>(null)
  const [pictureState, setPictureState] = useState<PictureState>('idle')
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace('/admin/login')
    }
  }, [authLoading, isAuthenticated, router])

  useEffect(() => {
    if (!isAuthenticated || !session || !mentorId) return

    let mounted = true
    const loadMentor = async (): Promise<void> => {
      try {
        setIsLoading(true)
        setError(null)
        const data = await getModerationMentorById(mentorId)
        if (!data) {
          setError('Mentor not found')
          return
        }

        if (session.role === 'moderator' && data.status !== 'pending') {
          router.replace('/admin/mentors/pending')
          return
        }

        if (!mounted) return
        setMentor(data)
        setFormData(buildFormData(data, session.role === 'admin'))
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to load mentor')
        }
      } finally {
        if (mounted) {
          setIsLoading(false)
        }
      }
    }

    loadMentor()
    return () => {
      mounted = false
    }
  }, [isAuthenticated, session, mentorId, router])

  useEffect(() => {
    if (!session || session.role !== 'moderator' || !mentor) return
    if (mentor.status !== 'pending') {
      router.replace('/admin/mentors/pending')
    }
  }, [mentor, session, router])

  const availableTags = useMemo(() => {
    const selected = formData?.tags || []
    return Array.from(new Set([...filters.tags, ...filters.sponsors, ...selected])).sort((a, b) =>
      a.localeCompare(b)
    )
  }, [formData?.tags])

  const handleInputChange = (
    field: keyof AdminMentorProfileUpdateRequest,
    value: string | string[]
  ): void => {
    if (!formData) return
    setFormData({ ...formData, [field]: value })
    setSaveState('idle')
  }

  const toggleTag = (tag: string): void => {
    if (!formData) return
    const hasTag = formData.tags.includes(tag)
    const nextTags = hasTag ? formData.tags.filter((item) => item !== tag) : [...formData.tags, tag]
    setFormData({ ...formData, tags: nextTags })
    setSaveState('idle')
  }

  const onSave = async (): Promise<void> => {
    if (!mentor || !formData) return
    setSaveState('loading')
    setActionError(null)
    try {
      const updated = await updateModerationMentor(mentor.mentorId, formData)
      setMentor(updated)
      setFormData(buildFormData(updated, session?.role === 'admin'))
      setSaveState('success')
    } catch (err) {
      setSaveState('error')
      setActionError(err instanceof Error ? err.message : 'Failed to save changes')
    }
  }

  const onApprove = async (): Promise<void> => {
    if (!mentor) return
    setSaveState('idle')
    setActionError(null)
    try {
      const updated = await approveModerationMentor(mentor.mentorId)
      setMentor(updated)
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to approve mentor')
    }
  }

  const onDecline = async (): Promise<void> => {
    if (!mentor) return
    setSaveState('idle')
    setActionError(null)
    try {
      const updated = await declineModerationMentor(mentor.mentorId)
      setMentor(updated)
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to decline mentor')
    }
  }

  const onToggleActive = async (status: 'active' | 'inactive'): Promise<void> => {
    if (!mentor || session?.role !== 'admin') return
    setSaveState('idle')
    setActionError(null)
    try {
      const updated = await updateModerationMentorStatus(mentor.mentorId, { status })
      setMentor(updated)
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to change status')
    }
  }

  const handleImageSelect = (event: ChangeEvent<HTMLInputElement>): void => {
    const file = event.target.files?.[0]
    if (!file) return

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      setActionError('Please select JPEG, PNG or WebP image')
      return
    }

    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) {
      setActionError('Image size should not exceed 10MB')
      return
    }

    setSelectedImage(file)
    const reader = new FileReader()
    reader.onloadend = () => {
      setImagePreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const onUploadPicture = async (): Promise<void> => {
    if (!mentor || !selectedImage || !imagePreview) return

    const payload: UploadProfilePictureRequest = {
      image: imagePreview,
      fileName: selectedImage.name,
      contentType: selectedImage.type,
    }

    setPictureState('loading')
    setSaveState('idle')
    setActionError(null)
    try {
      const result = await uploadModerationMentorPicture(mentor.mentorId, payload)
      if (!result.success) {
        throw new Error(result.message || 'Failed to upload image')
      }
      setPictureState('success')
      setSelectedImage(null)
      setImagePreview(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } catch (err) {
      setPictureState('error')
      setActionError(err instanceof Error ? err.message : 'Failed to upload image')
    }
  }

  if (authLoading || !isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <FontAwesomeIcon icon={faCircleNotch} className="animate-spin text-2xl text-indigo-500" />
      </div>
    )
  }

  return (
    <AdminLayout title="Mentor Review">
      <Head>
        <title>Mentor moderation — getmentor.dev</title>
      </Head>

      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <FontAwesomeIcon icon={faCircleNotch} className="animate-spin text-2xl text-indigo-500" />
        </div>
      )}

      {!isLoading && error && (
        <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {!isLoading && !error && mentor && formData && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-4">
              <Link
                href={getBackLink(mentor.status)}
                className="text-sm text-indigo-600 hover:text-indigo-500"
              >
                ← Back to list
              </Link>
              <Link
                href={`/mentor/${mentor.slug}`}
                target="_blank"
                rel="noreferrer"
                className="text-sm text-indigo-600 hover:text-indigo-500"
              >
                Open mentor profile ↗
              </Link>
            </div>
            <span
              className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${statusBadge(
                mentor.status
              )}`}
            >
              {mentor.status}
            </span>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={onApprove}
              className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
            >
              Approve
            </button>
            <button
              type="button"
              onClick={onDecline}
              className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
            >
              Decline
            </button>

            {session?.role === 'admin' && (
              <>
                <button
                  type="button"
                  onClick={() => onToggleActive('active')}
                  className="rounded-md border border-green-300 bg-green-50 px-4 py-2 text-sm font-medium text-green-800 hover:bg-green-100"
                >
                  Set active
                </button>
                <button
                  type="button"
                  onClick={() => onToggleActive('inactive')}
                  className="rounded-md border border-gray-300 bg-gray-100 px-4 py-2 text-sm font-medium text-gray-800 hover:bg-gray-200"
                >
                  Set inactive
                </button>
              </>
            )}
          </div>

          {actionError && saveState !== 'error' && (
            <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {actionError}
            </div>
          )}

          <div className="grid gap-4 rounded-md border border-gray-200 bg-white p-6 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Name</label>
              <input
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Email</label>
              <input
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Telegram</label>
              <input
                value={formData.telegram}
                onChange={(e) => handleInputChange('telegram', e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Job</label>
              <input
                value={formData.job}
                onChange={(e) => handleInputChange('job', e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Workplace</label>
              <input
                value={formData.workplace}
                onChange={(e) => handleInputChange('workplace', e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              />
            </div>
            {session?.role === 'admin' && (
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Slug</label>
                <input
                  value={formData.slug ?? ''}
                  onChange={(e) => handleInputChange('slug', e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                />
              </div>
            )}
            {session?.role === 'admin' && (
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Telegram Chat ID
                </label>
                <input
                  value={formData.telegramChatId ?? ''}
                  onChange={(e) => handleInputChange('telegramChatId', e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                  placeholder="e.g. -1001234567890"
                />
              </div>
            )}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Experience</label>
              <select
                value={formData.experience}
                onChange={(e) => handleInputChange('experience', e.target.value)}
                className="block w-full rounded-md border border-gray-300 bg-white py-2 pl-3 pr-8 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
              >
                <option value="">Select experience</option>
                {Object.keys(filters.experience).map((item) => (
                  <option
                    key={filters.experience[item as keyof typeof filters.experience]}
                    value={filters.experience[item as keyof typeof filters.experience]}
                  >
                    {item}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Price</label>
              <select
                value={formData.price}
                onChange={(e) => handleInputChange('price', e.target.value)}
                className="block w-full rounded-md border border-gray-300 bg-white py-2 pl-3 pr-8 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
              >
                <option value="">Select price</option>
                {filters.price.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Calendar URL</label>
              <input
                value={formData.calendarUrl}
                onChange={(e) => handleInputChange('calendarUrl', e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              />
            </div>

            <div className="md:col-span-2">
              <p className="mb-2 text-sm font-medium text-gray-700">
                Tags (including sponsor tags)
              </p>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {availableTags.map((tag) => {
                  const selected = formData.tags.includes(tag)
                  const sponsor = filters.sponsors.includes(tag)
                  return (
                    <label
                      key={tag}
                      className={`flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm ${
                        selected
                          ? sponsor
                            ? 'border-amber-400 bg-amber-50'
                            : 'border-indigo-400 bg-indigo-50'
                          : 'border-gray-200 bg-white'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selected}
                        onChange={() => toggleTag(tag)}
                        className="h-4 w-4"
                      />
                      <span>{tag}</span>
                    </label>
                  )
                })}
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium text-gray-700">About</label>
              <Wysiwyg
                key={`about-${mentor.updatedAt}`}
                content={formData.about}
                onUpdate={(editor) => handleInputChange('about', editor.getHTML())}
              />
            </div>
            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium text-gray-700">Description</label>
              <Wysiwyg
                key={`description-${mentor.updatedAt}`}
                content={formData.description}
                onUpdate={(editor) => handleInputChange('description', editor.getHTML())}
              />
            </div>
            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium text-gray-700">Competencies</label>
              <textarea
                value={formData.competencies}
                onChange={(e) => handleInputChange('competencies', e.target.value)}
                className="h-20 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              />
            </div>
          </div>

          {session?.role === 'admin' && (
            <div className="rounded-md border border-gray-200 bg-white p-6">
              <h3 className="mb-3 text-sm font-semibold text-gray-800">Profile picture</h3>
              <div className="mb-3 flex items-center gap-4">
                <Image
                  src={imagePreview || imageLoader({ src: mentor.slug, quality: 'full' })}
                  alt="Mentor picture"
                  width={96}
                  height={96}
                  className="h-24 w-24 rounded-full object-cover"
                  unoptimized
                />
                <div className="flex-1">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={handleImageSelect}
                    className="block w-full text-sm text-gray-500"
                  />
                  {pictureState === 'success' && (
                    <p className="mt-2 text-sm text-green-700">Picture uploaded successfully.</p>
                  )}
                  {pictureState === 'error' && (
                    <p className="mt-2 text-sm text-red-700">Picture upload failed.</p>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={onUploadPicture}
                disabled={pictureState === 'loading' || !selectedImage}
                className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {pictureState === 'loading' ? (
                  <>
                    <FontAwesomeIcon icon={faCircleNotch} className="mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  'Upload picture'
                )}
              </button>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={onSave}
              disabled={saveState === 'loading'}
              className="rounded-md bg-[#1A2238] px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saveState === 'loading' ? (
                <>
                  <FontAwesomeIcon icon={faCircleNotch} className="mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save changes'
              )}
            </button>
            {saveState === 'success' && (
              <span className="text-sm text-green-700">Mentor saved successfully.</span>
            )}
            {saveState === 'error' && (
              <span className="text-sm text-red-700">
                {actionError || 'Failed to save changes.'}
              </span>
            )}
          </div>
        </div>
      )}
    </AdminLayout>
  )
}

export default function MentorModerationEditPage(): JSX.Element {
  return (
    <AdminAuthProvider>
      <MentorModerationEditContent />
    </AdminAuthProvider>
  )
}
