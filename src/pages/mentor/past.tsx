/**
 * Mentor Past Requests Page
 *
 * Displays done, declined, and unavailable requests with pagination.
 */

import { useState, useEffect, useMemo } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleNotch, faArchive } from '@fortawesome/free-solid-svg-icons'
import type { MentorClientRequest, SortOrder } from '@/types'
import {
  MentorAuthProvider,
  useMentorAuth,
  MentorAdminLayout,
  RequestCard,
  SearchInput,
  SortToggle,
} from '@/components/mentor-admin'
import { getPastRequests } from '@/lib/mentor-admin-api'

const PAGE_SIZE = 20

/**
 * Filter requests by search query
 */
function filterRequests(requests: MentorClientRequest[], query: string): MentorClientRequest[] {
  if (!query.trim()) return requests

  const lowerQuery = query.toLowerCase()
  return requests.filter(
    (r) =>
      r.name.toLowerCase().includes(lowerQuery) ||
      r.email.toLowerCase().includes(lowerQuery) ||
      r.telegram.toLowerCase().includes(lowerQuery) ||
      r.details.toLowerCase().includes(lowerQuery) ||
      r.id.toLowerCase().includes(lowerQuery)
  )
}

/**
 * Sort requests by creation date
 */
function sortRequests(requests: MentorClientRequest[], order: SortOrder): MentorClientRequest[] {
  return [...requests].sort((a, b) => {
    const dateA = new Date(a.createdAt).getTime()
    const dateB = new Date(b.createdAt).getTime()
    return order === 'newest' ? dateB - dateA : dateA - dateB
  })
}

function PastRequestsContent(): JSX.Element {
  const router = useRouter()
  const { isAuthenticated, isLoading: authLoading } = useMentorAuth()
  const [requests, setRequests] = useState<MentorClientRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest')
  const [showOnlyWithReview, setShowOnlyWithReview] = useState(false)
  const [displayCount, setDisplayCount] = useState(PAGE_SIZE)

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace('/mentor/login')
    }
  }, [authLoading, isAuthenticated, router])

  // Load requests when page is mounted (lazy loading as per spec)
  useEffect(() => {
    if (!isAuthenticated) return

    const loadRequests = async (): Promise<void> => {
      try {
        setIsLoading(true)
        setError(null)
        const data = await getPastRequests()
        setRequests(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Не удалось загрузить заявки')
      } finally {
        setIsLoading(false)
      }
    }

    loadRequests()
  }, [isAuthenticated])

  // Filter and sort requests
  const filteredRequests = useMemo(() => {
    let result = filterRequests(requests, searchQuery)
    if (showOnlyWithReview) {
      result = result.filter((r) => r.review && r.review.trim() !== '')
    }
    return sortRequests(result, sortOrder)
  }, [requests, searchQuery, sortOrder, showOnlyWithReview])

  // Paginated requests
  const displayedRequests = useMemo(
    () => filteredRequests.slice(0, displayCount),
    [filteredRequests, displayCount]
  )

  const hasMore = displayCount < filteredRequests.length

  const loadMore = (): void => {
    setDisplayCount((prev) => Math.min(prev + PAGE_SIZE, filteredRequests.length))
  }

  // Reset pagination when search, sort, or filter changes
  useEffect(() => {
    setDisplayCount(PAGE_SIZE)
  }, [searchQuery, sortOrder, showOnlyWithReview])

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
        <title>Архив заявок — getmentor.dev</title>
      </Head>

      <MentorAdminLayout title="Архив заявок">
        {/* Search, Sort, and Filter */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex-1 max-w-md">
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Поиск по имени, email, telegram..."
            />
          </div>
          <SortToggle value={sortOrder} onChange={setSortOrder} />
          <label className="inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={showOnlyWithReview}
              onChange={(e) => setShowOnlyWithReview(e.target.checked)}
              className="sr-only peer"
            />
            <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            <span className="ms-3 text-sm font-medium text-gray-700">С отзывом</span>
          </label>
        </div>

        {/* Loading state */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-12">
            <FontAwesomeIcon
              icon={faCircleNotch}
              className="animate-spin text-indigo-500 text-2xl mb-3"
            />
            <p className="text-gray-500">Загрузка заявок...</p>
          </div>
        )}

        {/* Error state */}
        {error && !isLoading && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-2 text-sm text-red-600 hover:text-red-700 underline"
            >
              Попробовать снова
            </button>
          </div>
        )}

        {/* Empty state */}
        {!isLoading && !error && requests.length === 0 && (
          <div className="text-center py-12">
            <FontAwesomeIcon icon={faArchive} className="text-gray-300 text-5xl mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">Архив пуст</h3>
            <p className="text-gray-500">Завершённые и отклонённые заявки появятся здесь</p>
          </div>
        )}

        {/* No search results */}
        {!isLoading && !error && requests.length > 0 && filteredRequests.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">По запросу «{searchQuery}» ничего не найдено</p>
            <button
              onClick={() => setSearchQuery('')}
              className="mt-2 text-sm text-indigo-600 hover:text-indigo-500"
            >
              Сбросить поиск
            </button>
          </div>
        )}

        {/* Requests list */}
        {!isLoading && !error && displayedRequests.length > 0 && (
          <>
            <div className="space-y-4">
              {displayedRequests.map((request) => (
                <RequestCard key={request.id} request={request} />
              ))}
            </div>

            {/* Pagination info and load more */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500 mb-3">
                Показано {displayedRequests.length} из {filteredRequests.length} заявок
              </p>
              {hasMore && (
                <button
                  onClick={loadMore}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Показать ещё
                </button>
              )}
            </div>
          </>
        )}
      </MentorAdminLayout>
    </>
  )
}

export default function MentorPastRequestsPage(): JSX.Element {
  return (
    <MentorAuthProvider>
      <PastRequestsContent />
    </MentorAuthProvider>
  )
}
