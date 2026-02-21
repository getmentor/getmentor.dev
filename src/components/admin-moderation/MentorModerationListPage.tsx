import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleNotch } from '@fortawesome/free-solid-svg-icons'
import type { MentorModerationFilter, AdminMentorListItem } from '@/types'
import { useAdminAuth } from './AdminAuthContext'
import { AdminLayout } from './AdminLayout'
import { getModerationMentors } from '@/lib/admin-moderation-api'

const PAGE_SIZE = 50

interface MentorModerationListPageProps {
  status: MentorModerationFilter
  title: string
}

function getStatusBadge(status: AdminMentorListItem['status']): string {
  if (status === 'active') return 'bg-green-100 text-green-800'
  if (status === 'inactive') return 'bg-gray-200 text-gray-800'
  if (status === 'declined') return 'bg-red-100 text-red-800'
  return 'bg-yellow-100 text-yellow-800'
}

export function MentorModerationListPage({
  status,
  title,
}: MentorModerationListPageProps): JSX.Element {
  const router = useRouter()
  const { isAuthenticated, isLoading: authLoading, session } = useAdminAuth()
  const [mentors, setMentors] = useState<AdminMentorListItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [page, setPage] = useState(1)

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace('/admin/login')
      return
    }

    if (session?.role === 'moderator' && status !== 'pending') {
      router.replace('/admin/mentors/pending')
    }
  }, [authLoading, isAuthenticated, router, session, status])

  useEffect(() => {
    if (!isAuthenticated || !session) return
    let mounted = true

    const loadMentors = async (): Promise<void> => {
      try {
        setIsLoading(true)
        setError(null)
        const data = await getModerationMentors(status)
        if (mounted) {
          setMentors(data)
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to load mentors')
        }
      } finally {
        if (mounted) {
          setIsLoading(false)
        }
      }
    }

    loadMentors()
    return () => {
      mounted = false
    }
  }, [isAuthenticated, session, status])

  const filteredMentors = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    const sorted = [...mentors].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    if (!query) return sorted

    return sorted.filter((mentor) => {
      const name = mentor.name.toLowerCase()
      const email = mentor.email.toLowerCase()
      const telegram = mentor.telegram.toLowerCase()
      return name.includes(query) || email.includes(query) || telegram.includes(query)
    })
  }, [mentors, searchQuery])

  const totalPages = Math.max(1, Math.ceil(filteredMentors.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const pageItems = filteredMentors.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  useEffect(() => {
    setPage(1)
  }, [searchQuery, mentors.length])

  if (authLoading || !isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <FontAwesomeIcon icon={faCircleNotch} className="animate-spin text-2xl text-indigo-500" />
      </div>
    )
  }

  return (
    <AdminLayout title={title}>
      <div className="mb-4">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by name, email, telegram"
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
        />
      </div>

      <div className="mb-4 text-sm text-gray-600">
        Showing {pageItems.length} of {filteredMentors.length}
      </div>

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

      {!isLoading && !error && pageItems.length === 0 && (
        <div className="rounded-md border border-gray-200 bg-white p-6 text-sm text-gray-600">
          No mentors found.
        </div>
      )}

      {!isLoading && !error && pageItems.length > 0 && (
        <div className="space-y-3">
          {pageItems.map((mentor) => (
            <Link
              key={mentor.mentorId}
              href={`/admin/mentors/${mentor.mentorId}`}
              className="block rounded-md border border-gray-200 bg-white p-4 hover:border-indigo-300"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-base font-semibold text-gray-900">{mentor.name}</p>
                  <p className="text-sm text-gray-600">{mentor.email}</p>
                  <p className="text-sm text-gray-500">@{mentor.telegram}</p>
                </div>
                <span
                  className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${getStatusBadge(
                    mentor.status
                  )}`}
                >
                  {mentor.status}
                </span>
              </div>
              <div className="mt-3 text-sm text-gray-700">
                <p>
                  {mentor.job} {mentor.workplace ? `• ${mentor.workplace}` : ''}
                </p>
                <p>{mentor.price}</p>
              </div>
            </Link>
          ))}
        </div>
      )}

      {!isLoading && !error && filteredMentors.length > PAGE_SIZE && (
        <div className="mt-6 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            disabled={currentPage <= 1}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </span>
          <button
            type="button"
            onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
            disabled={currentPage >= totalPages}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </AdminLayout>
  )
}
