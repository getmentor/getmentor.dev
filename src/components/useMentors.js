import { useState, useEffect } from 'react'

export default function useMentors(allMentors, pageSize = 48) {
  const [searchInput, setSearchInput] = useState('')
  const [selectedTags, setSelectedTags] = useState([])
  const [mentorsCount, setMentorsCount] = useState(pageSize)

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
        mentor.description
      ).toLowerCase()
      const tokens = searchInput
        .toLowerCase()
        .split(',')
        .map((t) => t.trim())
      return hasAllInArray(tokens, searchContent)
    })
  }
  if (selectedTags.length) {
    filteredMentors = filteredMentors.filter((mentor) => hasAllTags(mentor.tags, selectedTags))
  }

  const mentors = filteredMentors.slice(0, mentorsCount)
  const hasMoreMentors = filteredMentors.length > mentorsCount

  return [
    mentors,
    searchInput,
    selectedTags,
    hasMoreMentors,
    setSearchInput,
    setSelectedTags,
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
