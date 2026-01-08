/**
 * Request Card component
 *
 * Displays a single request in list view.
 */

import Link from 'next/link'
import type { MentorClientRequest } from '@/types'
import StatusBadge from './StatusBadge'
import { formatDate } from './utils'

interface RequestCardProps {
  request: MentorClientRequest
}

/**
 * Truncate text to specified length
 */
function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength).trim() + '...'
}

export default function RequestCard({ request }: RequestCardProps): JSX.Element {
  return (
    <Link
      href={`/mentor/requests/${request.id}`}
      className="block bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md hover:border-gray-300 transition-all"
    >
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-4">
        {/* Main info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-base font-medium text-gray-900 truncate">{request.name}</h3>
            <StatusBadge status={request.status} />
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500 mb-2">
            <span className="truncate">{request.email}</span>
            <span className="inline-flex items-center px-2 py-0.5 rounded bg-gray-100 text-gray-600 text-xs">
              {request.level}
            </span>
          </div>

          <p className="text-sm text-gray-600 line-clamp-2">{truncate(request.details, 150)}</p>
        </div>

        {/* Date */}
        <div className="flex-shrink-0 text-sm text-gray-500 sm:text-right">
          <time dateTime={request.createdAt}>{formatDate(request.createdAt)}</time>
        </div>
      </div>
    </Link>
  )
}
