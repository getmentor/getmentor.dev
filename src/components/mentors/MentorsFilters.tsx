import classNames from 'classnames'
import allFilters from '@/config/filters'
import analytics from '@/lib/analytics'
import { useEffect } from 'react'
import FilterGroupDropdown from './FilterGroupDropdown'
import type { AppliedFilters } from '@/types'

interface MentorsFiltersProps {
  tags?: string[]
  experiences?: string[]
  allowSponsors?: boolean
  appliedFilters: AppliedFilters
}

interface MultiValueFilter {
  values: string[]
  set: (values: string[]) => void
  reset: () => void
}

interface SingleValueFilter {
  values: string | undefined
  set: (value: string | undefined) => void
  reset: () => void
}

export default function MentorsFilters(props: MentorsFiltersProps): JSX.Element {
  const { allowSponsors = true, appliedFilters } = props

  useEffect(() => {
    if (window?.location?.hash?.startsWith('#tags:')) {
      const data = window?.location?.hash.split(':')
      let newTags = data[1] ? data[1].split('|').map((t) => decodeURI(t)) : []
      newTags = newTags.filter(
        (item) => allFilters.tags.includes(item) || allFilters.sponsors.includes(item)
      )

      appliedFilters.tags.set(newTags)

      if (newTags.length > 0) {
        analytics.event(analytics.events.MENTOR_FILTERS_INITIALIZED_FROM_URL, {
          tags_count: newTags.length,
        })
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Intentionally run once on mount - read URL hash on initial load

  const onResetAll = (): void => {
    appliedFilters.tags.reset()
    appliedFilters.experience.reset()
    appliedFilters.price.reset()
    appliedFilters.noSessions.reset()
    appliedFilters.newMentor.reset()

    analytics.event(analytics.events.MENTOR_FILTERS_RESET)
    history.replaceState(null, '', '#')
  }

  const onClickTag = (tag: string): void => {
    const newTags = onClickFilterMultiple(tag, appliedFilters.tags, 'tag')

    history.replaceState(null, '', '#tags:' + newTags.join('|'))
  }

  const onClickExperience = (experience: string): void => {
    onClickFilterMultiple(experience, appliedFilters.experience, 'experience')
  }

  const onClickNoSessions = (): void => {
    const selected = appliedFilters.noSessions.value
    appliedFilters.noSessions.set(!selected)
    analytics.event(analytics.events.MENTOR_FILTER_CHANGED, {
      filter_type: 'no_sessions',
      action: selected ? 'removed' : 'added',
    })
  }

  const onClickNewMentor = (): void => {
    const selected = appliedFilters.newMentor.value
    appliedFilters.newMentor.set(!selected)
    analytics.event(analytics.events.MENTOR_FILTER_CHANGED, {
      filter_type: 'new_mentor',
      action: selected ? 'removed' : 'added',
    })
  }

  const onClickPrice = (price: string): void => {
    onClickFilterSingle(price, appliedFilters.price, 'price')
  }

  const onClickFilterMultiple = (
    newValue: string,
    filter: MultiValueFilter,
    filterType: string
  ): string[] => {
    let newValues: string[] = []

    if (filter.values.includes(newValue)) {
      newValues = filter.values.filter((item) => item !== newValue)

      analytics.event(analytics.events.MENTOR_FILTER_CHANGED, {
        filter_type: filterType,
        filter_value: newValue,
        action: 'removed',
      })
    } else {
      newValues = [...filter.values, newValue]

      analytics.event(analytics.events.MENTOR_FILTER_CHANGED, {
        filter_type: filterType,
        filter_value: newValue,
        action: 'added',
      })
    }

    filter.set(newValues)

    return newValues
  }

  const onClickFilterSingle = (
    newValue: string,
    filter: SingleValueFilter,
    filterType: string
  ): string => {
    if (filter.values === newValue) {
      filter.set(undefined)

      analytics.event(analytics.events.MENTOR_FILTER_CHANGED, {
        filter_type: filterType,
        filter_value: newValue,
        action: 'removed',
      })
    } else {
      filter.set(newValue)

      analytics.event(analytics.events.MENTOR_FILTER_CHANGED, {
        filter_type: filterType,
        filter_value: newValue,
        action: 'added',
      })
    }

    return newValue
  }

  return (
    <div className="text-center">
      <ul className="flex flex-wrap justify-left -m-1 mb-3">
        {allowSponsors && (
          <>
            {allFilters.sponsors.map((tag) => {
              const isActive = appliedFilters.tags.values.includes(tag)

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

        <li>
          <FilterGroupDropdown
            title="Development"
            values={allFilters.byTags.development}
            onFilterSelect={onClickTag}
            allSelectedValues={appliedFilters.tags.values}
          />
        </li>

        <li>
          <FilterGroupDropdown
            title="Management"
            values={allFilters.byTags.management}
            onFilterSelect={onClickTag}
            allSelectedValues={appliedFilters.tags.values}
          />
        </li>

        <li>
          <FilterGroupDropdown
            title="DevOps"
            values={allFilters.byTags.ops}
            onFilterSelect={onClickTag}
            allSelectedValues={appliedFilters.tags.values}
          />
        </li>

        <li>
          <FilterGroupDropdown
            title="HR"
            values={allFilters.byTags.hr}
            onFilterSelect={onClickTag}
            allSelectedValues={appliedFilters.tags.values}
          />
        </li>

        <li>
          <FilterGroupDropdown
            title="Marketing"
            values={allFilters.byTags.marketing}
            onFilterSelect={onClickTag}
            allSelectedValues={appliedFilters.tags.values}
          />
        </li>

        {allFilters.byTags.rest.map((tag) => {
          const isActive = appliedFilters.tags.values.includes(tag)

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

      <hr />

      <ul className="flex flex-wrap justify-left -mx-1 mb-1 mt-1">
        <li>
          <FilterGroupDropdown
            title="Опыт"
            values={Object.keys(allFilters.experience)}
            onFilterSelect={onClickExperience}
            allSelectedValues={appliedFilters.experience.values}
            theme="block"
          />
        </li>

        <li>
          <FilterGroupDropdown
            title="Цена"
            values={Object.keys(allFilters.byPrice)}
            onFilterSelect={onClickPrice}
            allSelectedValues={appliedFilters.price.values}
            multiSelect={false}
            theme="block"
          />
        </li>

        <li
          className={classNames('text-sm rounded-full py-1 px-4 m-1 cursor-pointer', {
            'text-sm rounded-sm py-1 pl-4 pr-4 m-1 cursor-pointer bg-gray-300 text-gray-600 bg-indigo-200 hover:bg-gray-200 text-gray-600':
              !appliedFilters.newMentor.value,
            'text-sm rounded-sm py-1 pl-4 pr-4 m-1 cursor-pointer text-gray-600 bg-gray-700 text-white':
              appliedFilters.newMentor.value,
          })}
          key="newMentor"
          onClick={onClickNewMentor}
        >
          🎉 Новички
        </li>

        <li
          className={classNames('text-sm rounded-full py-1 px-4 m-1 cursor-pointer', {
            'text-sm rounded-sm py-1 pl-4 pr-4 m-1 cursor-pointer bg-gray-300 text-gray-600 bg-indigo-200 hover:bg-gray-200 text-gray-600':
              !appliedFilters.noSessions.value,
            'text-sm rounded-sm py-1 pl-4 pr-4 m-1 cursor-pointer text-gray-600 bg-gray-700 text-white':
              appliedFilters.noSessions.value,
          })}
          key="noSessions"
          onClick={onClickNoSessions}
        >
          🫶 Без сессий
        </li>

        <li
          className="text-sm rounded-sm py-1 px-4 m-1 cursor-pointer bg-primary-900 hover:bg-red-500 text-white"
          key="reset"
          onClick={onResetAll}
        >
          Сбросить все
        </li>
      </ul>
    </div>
  )
}
