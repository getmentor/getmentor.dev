import { useEffect, useMemo, useState, type FormEvent } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleNotch } from '@fortawesome/free-solid-svg-icons'
import {
  ADMIN_REQUEST_STATUSES,
  ADMIN_REQUEST_STATUS_LABELS,
  buildAdminRequestsQueryString,
} from '@/types'
import type { AdminRequestsListResponse, AdminRequestsQuery, RequestStatus } from '@/types'
import { getAdminRequests } from '@/lib/admin-moderation-api'
import { formatDateTime } from '@/components/mentor-admin/utils'
import { useAdminAuth } from './AdminAuthContext'
import { AdminLayout } from './AdminLayout'
import { AdminRequestStatusBadge } from './AdminRequestStatusBadge'

const PAGE_SIZE = 20

interface FilterForm {
  mentorId: string
  mentorEmail: string
  mentorName: string
  menteeEmail: string
  status: RequestStatus | ''
}

const EMPTY_FILTERS: FilterForm = {
  mentorId: '',
  mentorEmail: '',
  mentorName: '',
  menteeEmail: '',
  status: '',
}

function firstValue(value: string | string[] | undefined): string {
  return (Array.isArray(value) ? value[0] : value) ?? ''
}

/** Read filters and page from the URL so pages are linkable (e.g. from a mentor page). */
function parseRouterQuery(query: Record<string, string | string[] | undefined>): {
  filters: FilterForm
  page: number
} {
  const status = firstValue(query.status)
  const page = parseInt(firstValue(query.page), 10)
  return {
    filters: {
      mentorId: firstValue(query.mentorId),
      mentorEmail: firstValue(query.mentorEmail),
      mentorName: firstValue(query.mentorName),
      menteeEmail: firstValue(query.menteeEmail),
      status: ADMIN_REQUEST_STATUSES.includes(status as RequestStatus)
        ? (status as RequestStatus)
        : '',
    },
    page: Number.isFinite(page) && page > 0 ? page : 1,
  }
}

const inputClass =
  'w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none'

export function AdminRequestsListPage(): JSX.Element {
  const router = useRouter()
  const { isAuthenticated, isLoading: authLoading, session } = useAdminAuth()

  // A normalized string key keeps effects from re-running on unrelated router changes
  const queryKey = (() => {
    const parsed = parseRouterQuery(router.query)
    return buildAdminRequestsQueryString({ ...parsed.filters, page: parsed.page })
  })()
  const { filters: appliedFilters, page } = useMemo(
    () => parseRouterQuery(Object.fromEntries(new URLSearchParams(queryKey))),
    [queryKey]
  )
  const [form, setForm] = useState<FilterForm>(EMPTY_FILTERS)
  const [data, setData] = useState<AdminRequestsListResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace('/admin/login')
      return
    }
    if (session?.role === 'moderator') {
      router.replace('/admin/mentors/pending')
    }
  }, [authLoading, isAuthenticated, router, session])

  // Keep the form in sync with the URL (back/forward navigation, deep links)
  useEffect(() => {
    if (router.isReady) setForm(appliedFilters)
  }, [router.isReady, appliedFilters])

  useEffect(() => {
    if (!router.isReady || !isAuthenticated || session?.role !== 'admin') return
    let mounted = true

    const load = async (): Promise<void> => {
      try {
        setIsLoading(true)
        setError(null)
        const result = await getAdminRequests({ ...appliedFilters, page, pageSize: PAGE_SIZE })
        if (mounted) setData(result)
      } catch (err) {
        if (mounted) setError(err instanceof Error ? err.message : 'Failed to load requests')
      } finally {
        if (mounted) setIsLoading(false)
      }
    }

    load()
    return () => {
      mounted = false
    }
  }, [router.isReady, isAuthenticated, session, appliedFilters, page])

  const navigate = (query: AdminRequestsQuery): void => {
    const qs = buildAdminRequestsQueryString({
      ...query,
      page: query.page && query.page > 1 ? query.page : undefined,
    })
    router.push(`/admin/requests${qs ? `?${qs}` : ''}`, undefined, { shallow: true })
  }

  const onApply = (event: FormEvent): void => {
    event.preventDefault()
    navigate({ ...form, page: 1 })
  }

  const onReset = (): void => {
    setForm(EMPTY_FILTERS)
    navigate({})
  }

  const goToPage = (nextPage: number): void => {
    navigate({ ...appliedFilters, page: nextPage })
  }

  if (authLoading || !isAuthenticated || session?.role !== 'admin') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <FontAwesomeIcon icon={faCircleNotch} className="animate-spin text-2xl text-indigo-500" />
      </div>
    )
  }

  const totalPages = data?.totalPages ?? 0
  const requests = data?.requests ?? []

  return (
    <AdminLayout title="Client Requests">
      <form
        onSubmit={onApply}
        className="mb-4 grid gap-3 rounded-md border border-gray-200 bg-white p-4 md:grid-cols-3"
      >
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">Mentor ID</label>
          <input
            value={form.mentorId}
            onChange={(e) => setForm({ ...form, mentorId: e.target.value })}
            placeholder="UUID or numeric ID"
            className={inputClass}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">Mentor email</label>
          <input
            value={form.mentorEmail}
            onChange={(e) => setForm({ ...form, mentorEmail: e.target.value })}
            className={inputClass}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">Mentor name</label>
          <input
            value={form.mentorName}
            onChange={(e) => setForm({ ...form, mentorName: e.target.value })}
            className={inputClass}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">Mentee email</label>
          <input
            value={form.menteeEmail}
            onChange={(e) => setForm({ ...form, menteeEmail: e.target.value })}
            className={inputClass}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">Status</label>
          <select
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value as RequestStatus | '' })}
            className={`${inputClass} bg-white`}
          >
            <option value="">All statuses</option>
            {ADMIN_REQUEST_STATUSES.map((status) => (
              <option key={status} value={status}>
                {ADMIN_REQUEST_STATUS_LABELS[status]}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-end gap-2">
          <button
            type="submit"
            className="rounded-md bg-[#1A2238] px-4 py-2 text-sm font-medium text-white hover:opacity-90"
          >
            Apply filters
          </button>
          <button
            type="button"
            onClick={onReset}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            Reset
          </button>
        </div>
      </form>

      {data && !error && (
        <div className="mb-4 text-sm text-gray-600">
          {data.total} request{data.total === 1 ? '' : 's'} found
        </div>
      )}

      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <FontAwesomeIcon icon={faCircleNotch} className="animate-spin text-2xl text-indigo-500" />
        </div>
      )}

      {error && !isLoading && (
        <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {!isLoading && !error && requests.length === 0 && (
        <div className="rounded-md border border-gray-200 bg-white p-6 text-sm text-gray-600">
          No requests found.
        </div>
      )}

      {!isLoading && !error && requests.length > 0 && (
        <div className="space-y-3">
          {requests.map((request) => (
            <Link
              key={request.id}
              href={`/admin/requests/${request.id}`}
              className="block rounded-md border border-gray-200 bg-white p-4 hover:border-indigo-300"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-base font-semibold text-gray-900">{request.name || '—'}</p>
                  <p className="text-sm text-gray-600">{request.email}</p>
                  {request.telegram && (
                    <p className="text-sm text-gray-500">@{request.telegram.replace(/^@/, '')}</p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-1">
                  <AdminRequestStatusBadge status={request.status} />
                  {request.hasReview && (
                    <span className="text-xs font-medium text-amber-700">★ Has review</span>
                  )}
                </div>
              </div>
              <div className="mt-3 flex flex-wrap justify-between gap-2 text-sm text-gray-700">
                <p>
                  Mentor:{' '}
                  {request.mentor ? (
                    <>
                      {request.mentor.name}{' '}
                      <span className="text-gray-500">({request.mentor.email})</span>
                    </>
                  ) : (
                    <span className="text-gray-500">deleted</span>
                  )}
                </p>
                <p className="text-gray-500">{formatDateTime(request.createdAt)}</p>
              </div>
            </Link>
          ))}
        </div>
      )}

      {!error && totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <button
            type="button"
            onClick={() => goToPage(page - 1)}
            disabled={isLoading || page <= 1}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-sm text-gray-600">
            Page {page} of {totalPages}
          </span>
          <button
            type="button"
            onClick={() => goToPage(page + 1)}
            disabled={isLoading || page >= totalPages}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </AdminLayout>
  )
}
