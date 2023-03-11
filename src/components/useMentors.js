import { useState, useEffect } from 'react'
import filters from '../config/filters'

export default function useMentors(allMentors, pageSize = 48) {
  const [searchInput, setSearchInput] = useState('')
  const [selectedTags, setSelectedTags] = useState([])
  const [mentorsCount, setMentorsCount] = useState(pageSize)

  const [selectedPrice, setSelectedPrice] = useState(undefined)
  const [selectedExperience, setSelectedExperience] = useState([])

  // reset pagination on filters change
  useEffect(() => {
    setMentorsCount(pageSize)
  }, [searchInput, selectedTags])

  const showMoreMentors = () => {
    setMentorsCount(mentorsCount + pageSize)
  }

  const hasAllTags = (mentorTags, selectedTags) => {
    for (const selectedTag of selectedTags) {
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
        mentor.description +
        ' ' +
        mentor.about +
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
    const selectedAirtableExperience = selectedExperience.map((e) => filters.experience[e])

    filteredMentors = filteredMentors.filter((mentor) =>
      selectedAirtableExperience.includes(mentor.experience)
    )
  }

  // filter by price
  if (selectedPrice) {
    const priceFilters = filters.byPrice[selectedPrice]

    filteredMentors = filteredMentors.filter((mentor) => priceFilters?.includes(mentor.price))
  }

  const mentors = filteredMentors.slice(0, mentorsCount)
  const hasMoreMentors = filteredMentors.length > mentorsCount

  return [
    mentors,
    searchInput,
    hasMoreMentors,
    setSearchInput,
    showMoreMentors,
    {
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
      count: () => {
        return selectedTags.length + selectedExperience.length + (selectedPrice ? 1 : 0)
      },
    },
  ]
}

/**
 * @param {Array} needles
 * @param {Array} haystack
 * @returns {boolean}
 */
function hasAllInArray(needles, haystack) {
  for (const needle of needles) {
    if (!haystack.includes(needle)) {
      return false
    }
  }
  return true
}
