import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSearch } from '@fortawesome/free-solid-svg-icons'

export default function MentorsSearch({ value, onChange }) {
  return (
    <div className="relative rounded-md">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <FontAwesomeIcon className="text-gray-500" icon={faSearch} size="lg" fixedWidth />
      </div>

      <input
        type="search"
        className="w-full border-gray-500 rounded-md focus:ring-gray-500 focus:border-gray-500 text-sm sm:text-lg text-gray-500 font-medium placeholder-gray-400 pl-12 py-2"
        placeholder="Профессия, инструмент, компания, имя ментора или что угодно, через запятую"
        autoComplete="off"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  )
}
