import classNames from 'classnames'
import allFilters from '../config/filters'
import analytics from '../lib/analytics'
import { useEffect } from 'react'
import FilterGroupDropdown from './FilterGroupDropdown'

export default function MentorsFilters(props) {
  const defaultProps = {
    tags: [],
    experiences: [],
    allowSponsors: true,
  }

  const {
    tags: selectedTags,
    experiences: selectedExperience,
    prices: selectedPrice,
    onChangeTags,
    onChangeExperience,
    onChangePrice,
    allowSponsors,
  } = { ...defaultProps, ...props }

  useEffect(() => {
    if (window?.location?.hash?.startsWith('#tags:')) {
      let data = window?.location?.hash.split(':')
      let newTags = data[1] ? data[1].split('|').map((t) => decodeURI(t)) : []
      newTags = newTags.filter(
        (item) => allFilters.tags.includes(item) || allFilters.sponsors.includes(item)
      )

      onChangeTags(newTags)

      if (newTags.length > 0) {
        analytics.event('Landed With Selected Tags', {
          tags: newTags,
        })
      }
    }
  }, [])

  const onResetAll = () => {
    onChangeTags([])
    onChangeExperience([])
    onChangePrice([])

    analytics.event('Reset All Filters')
    history.replaceState(null, null, '#')
  }

  const onClickTag = (tag) => {
    const newTags = onClickFilter(tag, selectedTags, onChangeTags, {
      onRemove: 'Filter Removed Tag',
      onAdd: 'Filter Added Tag',
    })

    history.replaceState(null, null, '#tags:' + newTags.join('|'))
  }

  const onClickExperience = (experience) => {
    const newExperiences = onClickFilter(experience, selectedExperience, onChangeExperience, {
      onRemove: 'Filter Removed Experience',
      onAdd: 'Filter Added Experience',
    })
  }

  const onClickPrice = (price) => {
    const newPrice = onClickFilter(price, selectedPrice, onChangePrice, {
      onRemove: 'Filter Removed Price',
      onAdd: 'Filter Added Price',
    })
  }

  const onClickFilter = (newValue, allValues, setValues, analyticsEvents) => {
    let newValues = []

    if (allValues.includes(newValue)) {
      newValues = allValues.filter((item) => item !== newValue)

      analytics.event(analyticsEvents.onRemove, {
        tagName: newValue,
      })
    } else {
      newValues = [...allValues, newValue]

      analytics.event(analyticsEvents.onAdd, {
        tagName: newValue,
      })
    }

    setValues(newValues)

    return newValues
  }

  return (
    <div className="text-center">
      <ul className="flex flex-wrap justify-center -m-1 mb-3">
        <li
          className="text-sm rounded-full py-1 px-4 m-1 cursor-pointer bg-primary-900 hover:bg-red-500 text-white"
          key="reset"
          onClick={onResetAll}
        >
          Сбросить все
        </li>

        {allowSponsors && (
          <>
            {allFilters.sponsors.map((tag) => {
              const isActive = selectedTags.includes(tag)

              return (
                <li
                  className={classNames('text-sm rounded-full py-1 px-4 m-1 cursor-pointer', {
                    'bg-indigo-200 hover:bg-indigo-300 text-gray-600': !isActive,
                    'bg-indigo-700 text-white': isActive,
                  })}
                  key={tag}
                  onClick={() => onClickTag(tag)}
                >
                  {tag}
                </li>
              )
            })}
          </>
        )}
      </ul>

      <ul className="flex flex-wrap justify-center -m-1 mb-3">
        <li>
          <FilterGroupDropdown
            title="Development"
            values={allFilters.t.development}
            onFilterSelect={onClickTag}
            allSelectedValues={selectedTags}
          />
        </li>

        <li>
          <FilterGroupDropdown
            title="Management"
            values={allFilters.t.management}
            onFilterSelect={onClickTag}
            allSelectedValues={selectedTags}
          />
        </li>

        <li>
          <FilterGroupDropdown
            title="DevOps"
            values={allFilters.t.ops}
            onFilterSelect={onClickTag}
            allSelectedValues={selectedTags}
          />
        </li>

        <li>
          <FilterGroupDropdown
            title="HR"
            values={allFilters.t.hr}
            onFilterSelect={onClickTag}
            allSelectedValues={selectedTags}
          />
        </li>

        <li>
          <FilterGroupDropdown
            title="Marketing"
            values={allFilters.t.marketing}
            onFilterSelect={onClickTag}
            allSelectedValues={selectedTags}
          />
        </li>
      </ul>

      <ul className="flex flex-wrap justify-center -m-1 mb-3">
        {allFilters.t.rest.map((tag) => {
          const isActive = selectedTags.includes(tag)

          return (
            <li
              className={classNames('text-sm rounded-full py-1 px-4 m-1 cursor-pointer', {
                'bg-gray-300 hover:bg-gray-200 text-gray-600': !isActive,
                'bg-gray-700 text-white': isActive,
              })}
              key={tag}
              onClick={() => onClickTag(tag)}
            >
              {tag}
            </li>
          )
        })}
      </ul>

      <ul className="flex flex-wrap justify-center m-1 mb-3">
        <li>
          <FilterGroupDropdown
            title="Цена"
            values={allFilters.price}
            onFilterSelect={onClickPrice}
            allSelectedValues={selectedPrice}
          />
        </li>

        <li>
          <FilterGroupDropdown
            title="Опыт"
            values={Object.keys(allFilters.experience)}
            onFilterSelect={onClickExperience}
            allSelectedValues={selectedExperience}
          />
        </li>
      </ul>
    </div>
  )
}
