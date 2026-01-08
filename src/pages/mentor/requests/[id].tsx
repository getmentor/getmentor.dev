/**
 * Request Details Page
 *
 * Displays full request information and allows status changes.
 */

import { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faCircleNotch,
  faArrowLeft,
  faEnvelope,
  faComment,
  faCalendar,
  faStar,
  faExternalLinkAlt,
  faPaperPlane,
} from '@fortawesome/free-solid-svg-icons'
import type { MentorClientRequest, RequestStatus, DeclineReasonValue } from '@/types'
import { STATUS_TRANSITIONS, STATUS_LABELS, ACTIVE_STATUSES } from '@/types'
import {
  MentorAuthProvider,
  useMentorAuth,
  MentorAdminLayout,
  StatusBadge,
  DeclineModal,
  formatDateTime,
} from '@/components/mentor-admin'
import { getRequestById, updateRequestStatus, declineRequest } from '@/lib/mentor-admin-api'

/**
 * Get the next status in the workflow
 */
function getNextStatus(currentStatus: RequestStatus): RequestStatus | null {
  const transitions = STATUS_TRANSITIONS[currentStatus]
  // Return the first non-declined transition (the main workflow transition)
  return transitions.find((s) => s !== 'declined') || null
}

/**
 * Check if status can be declined
 */
function canDecline(status: RequestStatus): boolean {
  return STATUS_TRANSITIONS[status].includes('declined')
}

interface InfoRowProps {
  icon: typeof faEnvelope
  label: string
  value: string
  href?: string
  external?: boolean
}

function InfoRow({ icon, label, value, href, external }: InfoRowProps): JSX.Element {
  const content = (
    <span className={href ? 'text-indigo-600 hover:text-indigo-500' : 'text-gray-900'}>
      {value}
      {external && <FontAwesomeIcon icon={faExternalLinkAlt} className="ml-1 text-xs" />}
    </span>
  )

  return (
    <div className="flex items-start py-3 border-b border-gray-100 last:border-0">
      <div className="flex-shrink-0 w-8">
        <FontAwesomeIcon icon={icon} className="text-gray-400" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-500 mb-0.5">{label}</p>
        {href ? (
          <a
            href={href}
            target={external ? '_blank' : undefined}
            rel={external ? 'noopener noreferrer' : undefined}
            className="text-sm font-medium"
          >
            {content}
          </a>
        ) : (
          <p className="text-sm font-medium text-gray-900">{value}</p>
        )}
      </div>
    </div>
  )
}

function RequestDetailsContent(): JSX.Element {
  const router = useRouter()
  const { id } = router.query
  const { isAuthenticated, isLoading: authLoading } = useMentorAuth()
  const [request, setRequest] = useState<MentorClientRequest | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)
  const [statusError, setStatusError] = useState<string | null>(null)
  const [showDeclineModal, setShowDeclineModal] = useState(false)

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace('/mentor/login')
    }
  }, [authLoading, isAuthenticated, router])

  // Load request
  useEffect(() => {
    if (!isAuthenticated || !id) return

    const loadRequest = async (): Promise<void> => {
      try {
        setIsLoading(true)
        setError(null)
        const data = await getRequestById(id as string)
        if (!data) {
          setError('Заявка не найдена')
        } else {
          setRequest(data)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Не удалось загрузить заявку')
      } finally {
        setIsLoading(false)
      }
    }

    loadRequest()
  }, [isAuthenticated, id])

  const handleStatusChange = async (newStatus: RequestStatus): Promise<void> => {
    if (!request) return

    setIsUpdatingStatus(true)
    setStatusError(null)

    try {
      const updated = await updateRequestStatus(request.id, newStatus)
      setRequest(updated)
    } catch (err) {
      setStatusError(err instanceof Error ? err.message : 'Не удалось обновить статус')
    } finally {
      setIsUpdatingStatus(false)
    }
  }

  const handleDecline = async (reason: DeclineReasonValue, comment?: string): Promise<void> => {
    if (!request) return

    const updated = await declineRequest(request.id, { reason, comment })
    setRequest(updated)
  }

  // Determine which list to go back to
  const backLink = request && ACTIVE_STATUSES.includes(request.status) ? '/mentor' : '/mentor/past'

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
        <title>{request ? `${request.name} — Заявка` : 'Заявка'} — getmentor.dev</title>
      </Head>

      <MentorAdminLayout>
        {/* Back link */}
        <div className="mb-6">
          <Link
            href={backLink}
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
          >
            <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
            Назад к списку
          </Link>
        </div>

        {/* Loading state */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-12">
            <FontAwesomeIcon
              icon={faCircleNotch}
              className="animate-spin text-indigo-500 text-2xl mb-3"
            />
            <p className="text-gray-500">Загрузка заявки...</p>
          </div>
        )}

        {/* Error state */}
        {error && !isLoading && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-800 mb-4">{error}</p>
            <Link
              href="/mentor"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[#1A2238] hover:opacity-90"
            >
              Вернуться к заявкам
            </Link>
          </div>
        )}

        {/* Request details */}
        {!isLoading && !error && request && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Header */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                  <div>
                    <h1 className="text-xl font-semibold text-gray-900">{request.name}</h1>
                    <p className="text-sm text-gray-500 mt-1">ID: {request.id}</p>
                  </div>
                  <StatusBadge status={request.status} className="self-start" />
                </div>

                {/* Level badge */}
                <div className="inline-flex items-center px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-sm">
                  Уровень: {request.level}
                </div>
              </div>

              {/* Details */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Описание запроса</h2>
                <p className="text-gray-700 whitespace-pre-wrap">{request.details}</p>
              </div>

              {/* Review (if exists) */}
              {request.review && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <FontAwesomeIcon icon={faStar} className="text-yellow-400" />
                    <h2 className="text-lg font-medium text-gray-900">Отзыв</h2>
                  </div>
                  <p className="text-gray-700 whitespace-pre-wrap mb-4">{request.review}</p>
                  {request.reviewUrl && (
                    <a
                      href={request.reviewUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-indigo-600 hover:text-indigo-500"
                    >
                      Открыть форму отзыва
                      <FontAwesomeIcon icon={faExternalLinkAlt} className="ml-1" />
                    </a>
                  )}
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Contact info */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Контакты</h2>
                <div className="space-y-1">
                  <InfoRow
                    icon={faEnvelope}
                    label="Email"
                    value={request.email}
                    href={`mailto:${request.email}`}
                  />
                  <InfoRow
                    icon={faPaperPlane}
                    label="Telegram"
                    value={request.telegram}
                    href={`https://t.me/${request.telegram.replace('@', '')}`}
                    external
                  />
                </div>
              </div>

              {/* Timestamps */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Даты</h2>
                <div className="space-y-1">
                  <InfoRow
                    icon={faCalendar}
                    label="Создана"
                    value={formatDateTime(request.createdAt)}
                  />
                  <InfoRow
                    icon={faComment}
                    label="Статус изменён"
                    value={formatDateTime(request.statusChangedAt)}
                  />
                  {request.scheduledAt && (
                    <InfoRow
                      icon={faCalendar}
                      label="Запланировано"
                      value={formatDateTime(request.scheduledAt)}
                    />
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Действия</h2>

                {/* Status error */}
                {statusError && (
                  <div className="mb-4 p-3 rounded-md bg-red-50 border border-red-200">
                    <p className="text-sm text-red-600">{statusError}</p>
                  </div>
                )}

                <div className="space-y-3">
                  {/* Next status button */}
                  {(() => {
                    const nextStatus = getNextStatus(request.status)
                    if (!nextStatus) return null
                    return (
                      <button
                        onClick={() => handleStatusChange(nextStatus)}
                        disabled={isUpdatingStatus}
                        className="w-full px-4 py-2 text-sm font-medium text-white bg-[#1A2238] rounded-md hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
                      >
                        {isUpdatingStatus ? (
                          <>
                            <FontAwesomeIcon icon={faCircleNotch} className="animate-spin mr-2" />
                            Обновление...
                          </>
                        ) : (
                          `Перевести в "${STATUS_LABELS[nextStatus]}"`
                        )}
                      </button>
                    )
                  })()}

                  {/* Decline button */}
                  {canDecline(request.status) && (
                    <button
                      onClick={() => setShowDeclineModal(true)}
                      disabled={isUpdatingStatus}
                      className="w-full px-4 py-2 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Отклонить заявку
                    </button>
                  )}

                  {/* No actions available */}
                  {!getNextStatus(request.status) && !canDecline(request.status) && (
                    <p className="text-sm text-gray-500 text-center py-2">
                      Заявка завершена, действия недоступны
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Decline Modal */}
        {request && (
          <DeclineModal
            isOpen={showDeclineModal}
            onClose={() => setShowDeclineModal(false)}
            onConfirm={handleDecline}
            menteName={request.name}
          />
        )}
      </MentorAdminLayout>
    </>
  )
}

export default function RequestDetailsPage(): JSX.Element {
  return (
    <MentorAuthProvider>
      <RequestDetailsContent />
    </MentorAuthProvider>
  )
}
