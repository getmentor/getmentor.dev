import { useState, useEffect } from 'react'
import filters from '../config/filters'

export default function useMentors(allMentors, pageSize = 48) {
  const [searchInput, setSearchInput] = useState('')
  const [selectedTags, setSelectedTags] = useState([])
  const [mentorsCount, setMentorsCount] = useState(pageSize)

  const [selectedPrice, setSelectedPrice] = useState([])
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
      const tokens = searchInput
        .toLowerCase()
        .split(',')
        .map((t) => t.trim())
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
  if (selectedPrice.length) {
    filteredMentors = filteredMentors.filter((mentor) => selectedPrice.includes(mentor.price))
  }

  const mentors = filteredMentors.slice(0, mentorsCount)
  const hasMoreMentors = filteredMentors.length > mentorsCount

  return [
    mentors,
    searchInput,
    selectedTags,
    selectedExperience,
    selectedPrice,
    hasMoreMentors,
    setSearchInput,
    setSelectedTags,
    setSelectedExperience,
    setSelectedPrice,
    showMoreMentors,
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
