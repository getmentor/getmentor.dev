import { ADMIN_REQUEST_STATUS_LABELS, STATUS_COLORS } from '@/types'
import type { RequestStatus } from '@/types'

interface AdminRequestStatusBadgeProps {
  status: RequestStatus
}

export function AdminRequestStatusBadge({ status }: AdminRequestStatusBadgeProps): JSX.Element {
  // Fallbacks keep unknown legacy statuses readable
  const colors = STATUS_COLORS[status] ?? { bg: 'bg-gray-100', text: 'text-gray-800' }
  const label = ADMIN_REQUEST_STATUS_LABELS[status] ?? status
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${colors.bg} ${colors.text}`}
    >
      {label}
    </span>
  )
}
