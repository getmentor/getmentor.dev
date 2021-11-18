import classNames from 'classnames'
import Dropdown from 'rc-dropdown'

import 'rc-dropdown/assets/index.css'

export default function FilterGroupDropdown({ title, values, onFilterSelect, allSelectedValues }) {
  const produceMenuItems = (list) => {
    return (
      <ul className="text-center mb-3 bg-gray-200 w-max p-1 rounded">
        {list.map((tag) => {
          const isActive = allSelectedValues.includes(tag)
          return (
            <li
              className={classNames(
                'text-center text-sm rounded-full py-1 px-4 m-1 cursor-pointer w-max',
                {
                  'bg-gray-300 hover:bg-gray-200 text-gray-600': !isActive,
                  'bg-gray-700 text-white': isActive,
                }
              )}
              key={tag}
              onClick={() => onFilterSelect(tag)}
            >
              {tag}
            </li>
          )
        })}
      </ul>
    )
  }

  const selectedValuesCount = allSelectedValues.filter((t) => values.includes(t)).length

  return (
    <Dropdown overlay={produceMenuItems(values)}>
      <button
        className={classNames(
          'text-sm rounded-full py-1 px-4 m-1 cursor-pointer bg-gray-300 text-gray-600',
          {
            'bg-gray-300 hover:bg-gray-200 text-gray-600': !selectedValuesCount,
            'bg-gray-700 text-white': selectedValuesCount,
          }
        )}
      >
        <span
          className={classNames('mr-2', {
            'text-gray-600': !selectedValuesCount,
            'bg-gray-700 text-white': selectedValuesCount,
          })}
        >
          {title}
        </span>
        <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 bg-red-500 rounded-full">
          {selectedValuesCount}
        </span>
      </button>
    </Dropdown>
  )
}
