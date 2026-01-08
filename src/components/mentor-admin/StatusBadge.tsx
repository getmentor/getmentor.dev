/**
 * Status Badge component
 *
 * Displays request status with appropriate styling.
 */

import classNames from 'classnames'
import type { RequestStatus } from '@/types'
import { STATUS_LABELS, STATUS_COLORS } from '@/types'

interface StatusBadgeProps {
  status: RequestStatus
  className?: string
}

export default function StatusBadge({ status, className }: StatusBadgeProps): JSX.Element {
  const colors = STATUS_COLORS[status]
  const label = STATUS_LABELS[status]

  return (
    <span
      className={classNames(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        colors.bg,
        colors.text,
        className
      )}
    >
      {label}
    </span>
  )
}
