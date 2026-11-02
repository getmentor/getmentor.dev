import { useEffect, useState, type ReactNode } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleNotch } from '@fortawesome/free-solid-svg-icons'
import {
  AdminAuthProvider,
  AdminLayout,
  AdminRequestStatusBadge,
  useAdminAuth,
} from '@/components/admin-moderation'
import { formatDateTime } from '@/components/mentor-admin/utils'
import {
  ADMIN_CLOSED_REQUEST_STATUSES,
  ADMIN_REQUEST_STATUSES,
  ADMIN_REQUEST_STATUS_LABELS,
  DECLINE_REASONS,
} from '@/types'
import type { AdminRequestDetails, RequestStatus } from '@/types'
import { getAdminRequestById, updateAdminRequestStatus } from '@/lib/admin-moderation-api'

function Field({ label, children }: { label: string; children: ReactNode }): JSX.Element {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</p>
      <div className="mt-1 text-sm text-gray-900">{children}</div>
    </div>
  )
}

function TextBlock({ label, text }: { label: string; text: string }): JSX.Element | null {
  if (!text) return null
  return (
    <div>
      <p className="mb-1 text-xs font-medium uppercase tracking-wide text-gray-500">{label}</p>
      <p className="whitespace-pre-wrap text-sm text-gray-800">{text}</p>
    </div>
  )
}

function declineReasonLabel(reason: string): string {
  return DECLINE_REASONS.find((item) => item.value === reason)?.label ?? reason
}

function AdminRequestDetailsContent(): JSX.Element {
  const router = useRouter()
  const { id } = router.query
  const requestId = Array.isArray(id) ? id[0] : id
  const { isAuthenticated, isLoading: authLoading, session } = useAdminAuth()

  const [request, setRequest] = useState<AdminRequestDetails | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pendingStatus, setPendingStatus] = useState<RequestStatus | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [actionSuccess, setActionSuccess] = useState<string | null>(null)

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace('/admin/login')
      return
    }
    if (session?.role === 'moderator') {
      router.replace('/admin/mentors/pending')
    }
  }, [authLoading, isAuthenticated, router, session])

  useEffect(() => {
    if (!isAuthenticated || session?.role !== 'admin' || !requestId) return
    let mounted = true

    const load = async (): Promise<void> => {
      try {
        setIsLoading(true)
        setError(null)
        const data = await getAdminRequestById(requestId)
        if (!mounted) return
        if (!data) {
          setError('Request not found')
          return
        }
        setRequest(data)
      } catch (err) {
        if (mounted) setError(err instanceof Error ? err.message : 'Failed to load request')
      } finally {
        if (mounted) setIsLoading(false)
      }
    }

    load()
    return () => {
      mounted = false
    }
  }, [isAuthenticated, session, requestId])

  const onChangeStatus = async (status: RequestStatus): Promise<void> => {
    if (!request || pendingStatus) return
    setPendingStatus(status)
    setActionError(null)
    setActionSuccess(null)
    try {
      const updated = await updateAdminRequestStatus(request.id, status)
      setRequest(updated)
      setActionSuccess(`Status changed to "${ADMIN_REQUEST_STATUS_LABELS[status]}".`)
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to change status')
    } finally {
      setPendingStatus(null)
    }
  }

  if (authLoading || !isAuthenticated || session?.role !== 'admin') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <FontAwesomeIcon icon={faCircleNotch} className="animate-spin text-2xl text-indigo-500" />
      </div>
    )
  }

  const isClosed = request ? ADMIN_CLOSED_REQUEST_STATUSES.includes(request.status) : false

  return (
    <AdminLayout title="Request Details">
      <Head>
        <title>Client request — admin — getmentor.dev</title>
      </Head>

      <div className="mb-4">
        <button
          type="button"
          onClick={() =>
            window.history.length > 1 ? router.back() : router.push('/admin/requests')
          }
          className="text-sm text-indigo-600 hover:text-indigo-500"
        >
          ← Back to list
        </button>
      </div>

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

      {!isLoading && !error && request && (
        <div className="space-y-6">
          <div className="rounded-md border border-gray-200 bg-white p-6">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <AdminRequestStatusBadge status={request.status} />
                <span className="text-sm text-gray-500">{isClosed ? 'Closed' : 'Open'}</span>
              </div>
              <span className="font-mono text-xs text-gray-400">{request.id}</span>
            </div>

            <p className="mb-2 text-sm font-medium text-gray-700">
              Change status (silent — no notifications are sent):
            </p>
            <div className="flex flex-wrap gap-2">
              {ADMIN_REQUEST_STATUSES.map((status) => {
                const isCurrent = status === request.status
                return (
                  <button
                    key={status}
                    type="button"
                    onClick={() => onChangeStatus(status)}
                    disabled={isCurrent || pendingStatus !== null}
                    className={
                      isCurrent
                        ? 'rounded-md bg-[#1A2238] px-3 py-2 text-sm font-medium text-white disabled:cursor-default'
                        : 'rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50'
                    }
                  >
                    {pendingStatus === status && (
                      <FontAwesomeIcon icon={faCircleNotch} className="mr-2 animate-spin" />
                    )}
                    {ADMIN_REQUEST_STATUS_LABELS[status]}
                  </button>
                )
              })}
            </div>
            {actionSuccess && <p className="mt-3 text-sm text-green-700">{actionSuccess}</p>}
            {actionError && <p className="mt-3 text-sm text-red-700">{actionError}</p>}
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4 rounded-md border border-gray-200 bg-white p-6">
              <h3 className="text-sm font-semibold text-gray-800">Mentee</h3>
              <Field label="Name">{request.name || '—'}</Field>
              <Field label="Email">
                {request.email ? (
                  <a href={`mailto:${request.email}`} className="text-indigo-600">
                    {request.email}
                  </a>
                ) : (
                  '—'
                )}
              </Field>
              <Field label="Telegram">
                {request.telegram ? `@${request.telegram.replace(/^@/, '')}` : '—'}
              </Field>
              <Field label="Level">{request.level || '—'}</Field>
            </div>

            <div className="space-y-4 rounded-md border border-gray-200 bg-white p-6">
              <h3 className="text-sm font-semibold text-gray-800">Mentor</h3>
              {request.mentor ? (
                <>
                  <Field label="Name">
                    <Link
                      href={`/admin/mentors/${request.mentor.mentorId}`}
                      className="text-indigo-600 hover:text-indigo-500"
                    >
                      {request.mentor.name}
                    </Link>
                  </Field>
                  <Field label="Email">{request.mentor.email || '—'}</Field>
                  <Field label="ID">
                    {request.mentor.id}{' '}
                    <span className="font-mono text-xs text-gray-400">
                      ({request.mentor.mentorId})
                    </span>
                  </Field>
                  <Field label="All requests">
                    <Link
                      href={`/admin/requests?mentorId=${request.mentor.mentorId}`}
                      className="text-indigo-600 hover:text-indigo-500"
                    >
                      View this mentor&apos;s requests →
                    </Link>
                  </Field>
                </>
              ) : (
                <p className="text-sm text-gray-500">Mentor record was deleted.</p>
              )}
            </div>
          </div>

          <div className="space-y-4 rounded-md border border-gray-200 bg-white p-6">
            <h3 className="text-sm font-semibold text-gray-800">Request</h3>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Field label="Created">{formatDateTime(request.createdAt)}</Field>
              <Field label="Updated">{formatDateTime(request.modifiedAt)}</Field>
              <Field label="Status changed">
                {request.statusChangedAt ? formatDateTime(request.statusChangedAt) : '—'}
              </Field>
              <Field label="Scheduled">
                {request.scheduledAt ? formatDateTime(request.scheduledAt) : '—'}
              </Field>
            </div>
            <TextBlock label="Description" text={request.details} />
            {request.declineReason && (
              <Field label="Decline reason">{declineReasonLabel(request.declineReason)}</Field>
            )}
            <TextBlock label="Decline comment" text={request.declineComment} />
          </div>

          <div className="space-y-4 rounded-md border border-gray-200 bg-white p-6">
            <h3 className="text-sm font-semibold text-gray-800">Review</h3>
            {request.review ? (
              <>
                <Field label="Submitted">{formatDateTime(request.review.createdAt)}</Field>
                <TextBlock label="About the mentor" text={request.review.mentorReview} />
                <TextBlock label="About the platform" text={request.review.platformReview} />
                <TextBlock label="Improvements" text={request.review.improvements} />
              </>
            ) : (
              <p className="text-sm text-gray-500">No review yet.</p>
            )}
          </div>
        </div>
      )}
    </AdminLayout>
  )
}

export default function AdminRequestDetailsPage(): JSX.Element {
  return (
    <AdminAuthProvider>
      <AdminRequestDetailsContent />
    </AdminAuthProvider>
  )
}
