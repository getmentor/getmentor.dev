/**
 * Mentor Active Requests Page
 *
 * Displays pending, contacted, and working requests.
 */

import { useState, useEffect, useMemo } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleNotch, faInbox } from '@fortawesome/free-solid-svg-icons'
import type { MentorClientRequest } from '@/types'
import {
  MentorAuthProvider,
  useMentorAuth,
  MentorAdminLayout,
  RequestCard,
  SearchInput,
} from '@/components/mentor-admin'
import { getActiveRequests } from '@/lib/mentor-admin-api'

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

function ActiveRequestsContent(): JSX.Element {
  const router = useRouter()
  const { isAuthenticated, isLoading: authLoading } = useMentorAuth()
  const [requests, setRequests] = useState<MentorClientRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace('/mentor/login')
    }
  }, [authLoading, isAuthenticated, router])

  // Load requests
  useEffect(() => {
    if (!isAuthenticated) return

    const loadRequests = async (): Promise<void> => {
      try {
        setIsLoading(true)
        setError(null)
        const data = await getActiveRequests()
        setRequests(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Не удалось загрузить заявки')
      } finally {
        setIsLoading(false)
      }
    }

    loadRequests()
  }, [isAuthenticated])

  // Filter requests by search
  const filteredRequests = useMemo(
    () => filterRequests(requests, searchQuery),
    [requests, searchQuery]
  )

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
        <title>Активные заявки — getmentor.dev</title>
      </Head>

      <MentorAdminLayout title="Активные заявки">
        {/* Search */}
        <div className="mb-6">
          <div className="max-w-md">
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Поиск по имени, email, telegram..."
            />
          </div>
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
            <FontAwesomeIcon icon={faInbox} className="text-gray-300 text-5xl mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">Нет активных заявок</h3>
            <p className="text-gray-500">Новые заявки от менти появятся здесь</p>
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
        {!isLoading && !error && filteredRequests.length > 0 && (
          <div className="space-y-4">
            {filteredRequests.map((request) => (
              <RequestCard key={request.id} request={request} />
            ))}
          </div>
        )}
      </MentorAdminLayout>
    </>
  )
}

export default function MentorIndexPage(): JSX.Element {
  return (
    <MentorAuthProvider>
      <ActiveRequestsContent />
    </MentorAuthProvider>
  )
}
