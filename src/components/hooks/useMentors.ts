import { useState, useEffect } from 'react'
import filters from '@/config/filters'
import type { MentorListItem, AppliedFilters, UseMentorsReturn } from '@/types'

// Pagination configuration
const DEFAULT_PAGE_SIZE = 48

export default function useMentors(
  allMentors: MentorListItem[],
  pageSize: number = DEFAULT_PAGE_SIZE
): UseMentorsReturn {
  const [searchInput, setSearchInput] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [mentorsCount, setMentorsCount] = useState(pageSize)

  const [selectedPrice, setSelectedPrice] = useState<string | undefined>(undefined)
  const [selectedExperience, setSelectedExperience] = useState<string[]>([])

  const [selectedNoSessions, setSelectedNoSessions] = useState(false)

  const [selectedNewMentor, setSelectedNewMentor] = useState(false)

  // reset pagination on filters change
  useEffect(() => {
    setMentorsCount(pageSize)
  }, [searchInput, selectedTags, pageSize])

  const showMoreMentors = (): void => {
    setMentorsCount(mentorsCount + pageSize)
  }

  const hasAllTags = (mentorTags: string[], tagsToCheck: string[]): boolean => {
    for (const selectedTag of tagsToCheck) {
      if (!mentorTags.includes(selectedTag)) {
        return false
      }
    }
    return true
  }

  let filteredMentors = allMentors

  if (searchInput.length >= 2) {
    const tokens = searchInput
      .toLowerCase()
      .split(',')
      .map((t) => t.trim())

    filteredMentors = filteredMentors.filter((mentor) => {
      const searchContent = (
        mentor.name +
        ' ' +
        mentor.job +
        ' ' +
        mentor.workplace +
        ' ' +
        (mentor.description || '') +
        ' ' +
        (mentor.about || '') +
        ' ' +
        mentor.competencies
      ).toLowerCase()

      return hasAllInArray(tokens, searchContent)
    })
  }

  // filter by tags
  if (selectedTags.length) {
    filteredMentors = filteredMentors.filter((mentor) => hasAllTags(mentor.tags, selectedTags))
  }

  // filter by experience
  if (selectedExperience.length) {
    const experienceValues = selectedExperience.map(
      (e) => filters.experience[e as keyof typeof filters.experience]
    )

    filteredMentors = filteredMentors.filter((mentor) =>
      experienceValues.includes(mentor.experience)
    )
  }

  // filter by price
  if (selectedPrice) {
    const priceFilters = filters.byPrice[selectedPrice as keyof typeof filters.byPrice]

    filteredMentors = filteredMentors.filter((mentor) => priceFilters?.includes(mentor.price))
  }

  // filter by no session
  if (selectedNoSessions) {
    filteredMentors = filteredMentors.filter((mentor) => mentor.menteeCount === 0)
  }

  // filter by new
  if (selectedNewMentor) {
    filteredMentors = filteredMentors.filter((mentor) => mentor.isNew)
  }

  const mentors = filteredMentors.slice(0, mentorsCount)
  const hasMoreMentors = filteredMentors.length > mentorsCount

  const appliedFilters: AppliedFilters = {
    tags: { values: selectedTags, set: setSelectedTags, reset: () => setSelectedTags([]) },
    experience: {
      values: selectedExperience,
      set: setSelectedExperience,
      reset: () => setSelectedExperience([]),
    },
    price: {
      values: selectedPrice,
      set: setSelectedPrice,
      reset: () => setSelectedPrice(undefined),
    },
    noSessions: {
      value: selectedNoSessions,
      set: setSelectedNoSessions,
      reset: () => setSelectedNoSessions(false),
    },
    newMentor: {
      value: selectedNewMentor,
      set: setSelectedNewMentor,
      reset: () => setSelectedNewMentor(false),
    },
    count: () => {
      return selectedTags.length + selectedExperience.length + (selectedPrice ? 1 : 0)
    },
  }

  return [mentors, searchInput, hasMoreMentors, setSearchInput, showMoreMentors, appliedFilters]
}

function hasAllInArray(needles: string[], haystack: string): boolean {
  for (const needle of needles) {
    if (!haystack.includes(needle)) {
      return false
    }
  }
  return true
}
