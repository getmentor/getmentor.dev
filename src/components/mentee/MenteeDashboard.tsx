/**
 * Mentee dashboard: every request sent from the logged-in mentee's email, grouped by
 * status. Read-only, except leaving a review on a done request.
 * Without a session it redirects to /mentee/login (the confirmation email links here).
 */

import { useCallback, useEffect, useMemo, useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/router'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleNotch } from '@fortawesome/free-solid-svg-icons'
import type { MenteeDashboardRequest, MenteeRequestGroup, MenteeReviewPayload } from '@/types'
import { MENTEE_GROUP_LABELS, MENTEE_GROUP_ORDER } from '@/types'
import { useMenteeAuth } from '@/components/mentee/MenteeAuthContext'
import MenteeRequestCard from '@/components/mentee/MenteeRequestCard'
import { getMenteeRequests, MenteeApiError, submitMenteeReview } from '@/lib/mentee-api'
import analytics from '@/lib/analytics'

export default function MenteeDashboard(): JSX.Element {
  const router = useRouter()
  const { isAuthenticated, isLoading, logout } = useMenteeAuth()
  const [requests, setRequests] = useState<MenteeDashboardRequest[] | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [logoutError, setLogoutError] = useState<string | null>(null)

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/mentee/login')
    }
  }, [isLoading, isAuthenticated, router])

  const load = useCallback(async () => {
    try {
      const list = await getMenteeRequests()
      setRequests(list)
      setLoadError(null)
      return list
    } catch (error) {
      if (error instanceof MenteeApiError && error.status === 401) {
        router.replace('/mentee/login')
        return null
      }
      setLoadError('Не удалось загрузить заявки. Попробуйте обновить страницу.')
      return null
    }
  }, [router])

  useEffect(() => {
    if (!isAuthenticated) return
    load().then((list) => {
      if (!list) return
      analytics.event(analytics.events.MENTEE_DASHBOARD_VIEWED, {
        requests_total: list.length,
        ...Object.fromEntries(
          MENTEE_GROUP_ORDER.map((g) => [`requests_${g}`, list.filter((r) => r.group === g).length])
        ),
      })
    })
  }, [isAuthenticated, load])

  const grouped = useMemo(() => {
    const out: Record<MenteeRequestGroup, MenteeDashboardRequest[]> = {
      pending: [],
      active: [],
      done: [],
      closed: [],
    }
    for (const r of requests || []) out[r.group]?.push(r)
    return out
  }, [requests])

  const handleSubmitReview = useCallback(
    async (request: MenteeDashboardRequest, payload: MenteeReviewPayload) => {
      try {
        await submitMenteeReview(request.id, payload)
        analytics.event(analytics.events.MENTEE_REVIEW_SUBMITTED, { outcome: 'success' })
      } catch (error) {
        analytics.event(analytics.events.MENTEE_REVIEW_SUBMITTED, {
          outcome: 'error',
          status_code: error instanceof MenteeApiError ? error.status : undefined,
        })
        throw error
      }
      await load()
    },
    [load]
  )

  const handleLogout = async (): Promise<void> => {
    setIsLoggingOut(true)
    setLogoutError(null)
    try {
      await logout()
    } catch {
      // The session may still be valid: stay here and let the user retry.
      setLogoutError('Не удалось выйти. Проверьте соединение и попробуйте ещё раз.')
      setIsLoggingOut(false)
      return
    }
    router.replace('/mentee/login')
  }

  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <FontAwesomeIcon icon={faCircleNotch} className="animate-spin text-indigo-500 text-2xl" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>Мои заявки — getmentor.dev</title>
        <meta name="robots" content="noindex,nofollow" />
      </Head>

      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 flex justify-between items-center h-16">
          <Link href="/" className="flex items-center">
            <Image src="/images/logo.png" width={120} height={24} alt="getmentor.dev" />
            <span className="ml-3 text-sm font-medium text-gray-500 hidden sm:block">
              Кабинет ученика
            </span>
          </Link>
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="text-sm text-gray-600 hover:text-gray-900 font-medium disabled:opacity-50"
          >
            {isLoggingOut ? 'Выход...' : 'Выйти'}
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {logoutError && (
          <div
            role="alert"
            className="mb-6 p-4 rounded-md bg-red-50 border border-red-200 text-sm text-red-700"
          >
            {logoutError}
          </div>
        )}

        <h1 className="text-2xl font-semibold text-gray-900">Мои заявки</h1>
        <p className="mt-1 text-sm text-gray-600">
          Все заявки, которые вы отправляли менторам с этого email.
        </p>

        {loadError && (
          <div className="mt-6 p-4 rounded-md bg-red-50 border border-red-200 text-sm text-red-700">
            {loadError}
          </div>
        )}

        {requests === null && !loadError && (
          <div className="mt-10 text-center">
            <FontAwesomeIcon icon={faCircleNotch} className="animate-spin text-gray-400 text-2xl" />
          </div>
        )}

        {requests !== null && requests.length === 0 && (
          <div className="mt-8 p-8 bg-white rounded-lg border border-gray-200 text-center text-gray-600">
            Заявок пока нет.{' '}
            <Link href="/" className="text-indigo-600 hover:text-indigo-500">
              Найти ментора
            </Link>
          </div>
        )}

        {requests !== null &&
          MENTEE_GROUP_ORDER.filter((g) => grouped[g].length > 0).map((group) => (
            <section key={group} className="mt-8" aria-labelledby={`mentee-group-${group}`}>
              <h2 id={`mentee-group-${group}`} className="text-lg font-medium text-gray-900 mb-3">
                {MENTEE_GROUP_LABELS[group]}{' '}
                <span className="text-gray-400 font-normal">{grouped[group].length}</span>
              </h2>
              <div className="space-y-4">
                {grouped[group].map((request) => (
                  <MenteeRequestCard
                    key={request.id}
                    request={request}
                    onSubmitReview={handleSubmitReview}
                  />
                ))}
              </div>
            </section>
          ))}
      </main>
    </div>
  )
}
