/**
 * Filter configuration types
 */

import type { MentorListItem } from './mentor'

/**
 * Filter configuration object
 */
export interface FiltersConfig {
  tags: string[]
  byTags: {
    development: string[]
    management: string[]
    ops: string[]
    hr: string[]
    marketing: string[]
    rest: string[]
  }
  price: string[]
  experience: Record<string, string>
  byPrice: Record<string, string[]>
  sponsors: string[]
}

/**
 * Generic filter state for array values
 */
export interface FilterState<T> {
  values: T
  set: (values: T) => void
  reset: () => void
}

/**
 * Boolean filter state
 */
export interface BooleanFilterState {
  value: boolean
  set: (value: boolean) => void
  reset: () => void
}

/**
 * Applied filters state (from useMentors hook)
 */
export interface AppliedFilters {
  tags: FilterState<string[]>
  experience: FilterState<string[]>
  price: FilterState<string | undefined>
  noSessions: BooleanFilterState
  newMentor: BooleanFilterState
  count: () => number
}

/**
 * useMentors hook return type
 */
export type UseMentorsReturn = [
  MentorListItem[],           // mentors
  string,                      // searchInput
  boolean,                     // hasMoreMentors
  (value: string) => void,     // setSearchInput
  () => void,                  // showMoreMentors
  AppliedFilters               // appliedFilters
]

/**
 * Filter group dropdown theme
 */
export type FilterTheme = 'rounded' | 'block'
