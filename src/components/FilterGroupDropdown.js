import Dropdown from 'rc-dropdown'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronCircleDown } from '@fortawesome/free-solid-svg-icons'

import 'rc-dropdown/assets/index.css'

export default function FilterGroupDropdown({
  title,
  values,
  onFilterSelect,
  allSelectedValues,
  multiSelect = true,
  theme = 'rounded',
}) {
  const themes = {
    rounded: {
      ul: 'text-center mb-3 bg-gray-200 w-max p-1 rounded',
      li: {
        active:
          'text-center text-sm rounded-full py-1 px-4 m-1 cursor-pointer w-max bg-gray-700 text-white',
        inactive:
          'text-center text-sm rounded-full py-1 px-4 m-1 cursor-pointer w-max bg-gray-300 hover:bg-gray-200 text-gray-600',
      },
      button: {
        selected:
          'text-sm rounded-full py-1 pl-4 pr-2 m-1 cursor-pointer text-gray-600 bg-gray-700 text-white',
        not_selected:
          'text-sm rounded-full py-1 pl-4 pr-2 m-1 cursor-pointer bg-gray-300 text-gray-600 bg-gray-300 hover:bg-gray-200 text-gray-600',
      },
      span: {
        selected: 'mr-2 bg-gray-700 text-white',
        not_selected: 'mr-2 text-gray-600',
      },
      badge:
        'inline-flex items-center justify-center px-2 py-1 mr-1 text-xs font-bold leading-none text-red-100 bg-red-500 rounded-full',
      arrow: {
        selected: 'ml-0 mt-0 text-primary',
        not_selected: 'ml-0 mt-0',
      },
    },
    block: {
      ul: 'text-center bg-gray-200 w-max',
      li: {
        active: 'text-center text-sm py-1 px-2 cursor-pointer w-auto bg-gray-700 text-white',
        inactive:
          'text-center text-sm py-1 px-2 cursor-pointer w-auto bg-gray-300 hover:bg-gray-200 text-gray-600',
      },
      button: {
        selected:
          'text-sm rounded-sm py-1 pl-4 pr-2 m-1 cursor-pointer text-gray-600 bg-gray-700 text-white',
        not_selected:
          'text-sm rounded-sm py-1 pl-4 pr-2 m-1 cursor-pointer bg-gray-300 text-gray-600 bg-indigo-200 hover:bg-gray-200 text-gray-600',
      },
      span: {
        selected: 'mr-2 bg-gray-700 text-white',
        not_selected: 'mr-2 text-gray-600',
      },
      badge:
        'inline-flex items-center justify-center px-2 py-1 mr-1 text-xs font-bold leading-none text-red-100 bg-red-500 rounded-full',
      arrow: {
        selected: 'ml-0 mt-0 text-primary',
        not_selected: 'ml-0 mt-0',
      },
    },
  }

  const produceMenuItems = (list) => {
    return (
      <ul className={themes[theme].ul}>
        {list.map((tag) => {
          const isActive = multiSelect ? allSelectedValues.includes(tag) : allSelectedValues === tag

          return (
            <li
              className={isActive ? themes[theme].li.active : themes[theme].li.inactive}
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

  const selectedValuesCount = multiSelect
    ? allSelectedValues.filter((t) => values.includes(t)).length
    : allSelectedValues

  return (
    <Dropdown overlay={produceMenuItems(values)}>
      <button
        className={
          selectedValuesCount ? themes[theme].button.selected : themes[theme].button.not_selected
        }
      >
        <span
          className={
            selectedValuesCount ? themes[theme].span.selected : themes[theme].span.not_selected
          }
        >
          {title}
        </span>
        {selectedValuesCount ? (
          <span className={themes[theme].badge}>{selectedValuesCount}</span>
        ) : (
          <span />
        )}
        <FontAwesomeIcon
          icon={faChevronCircleDown}
          size="1x"
          className={
            selectedValuesCount ? themes[theme].arrow.selected : themes[theme].arrow.not_selected
          }
        />
      </button>
    </Dropdown>
  )
}
