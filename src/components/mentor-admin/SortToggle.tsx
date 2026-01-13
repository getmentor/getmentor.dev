/**
 * Sort toggle component for request lists
 */

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowUp, faArrowDown } from '@fortawesome/free-solid-svg-icons'
import type { SortOrder } from '@/types'

interface SortToggleProps {
  value: SortOrder
  onChange: (order: SortOrder) => void
}

export default function SortToggle({ value, onChange }: SortToggleProps): JSX.Element {
  const toggle = (): void => {
    onChange(value === 'newest' ? 'oldest' : 'newest')
  }

  return (
    <button
      onClick={toggle}
      className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      title={value === 'newest' ? 'Сначала новые' : 'Сначала старые'}
    >
      <FontAwesomeIcon
        icon={value === 'newest' ? faArrowDown : faArrowUp}
        className="mr-2 text-gray-500"
      />
      {value === 'newest' ? 'Сначала новые' : 'Сначала старые'}
    </button>
  )
}
