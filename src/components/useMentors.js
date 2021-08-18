import { useState, useEffect } from 'react'

export default function useMentors(allMentors, pageSize = 48) {
  const [filteredMentors, setFilteredMentors] = useState(allMentors)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTags, setSelectedTags] = useState([])
  const [visibleMentorsCount, setVisibleMentorsCount] = useState(pageSize)

  const debouncedSearchQuery = useDebounce(searchQuery, 400)

  // send analytics for used searches
  useEffect(() => {
    if (debouncedSearchQuery) {
      console.log('search mentor', debouncedSearchQuery) // TODO insert real analytics
    }
  }, [debouncedSearchQuery])

  // filter mentors and save in cache
  useEffect(() => {
    let newFilteredMentors = allMentors
    if (debouncedSearchQuery.length >= 2) {
      newFilteredMentors = newFilteredMentors.filter((mentor) => {
        const searchContent = (mentor.name + ' ' + mentor.job + ' ' + mentor.description).toLowerCase()
        const tokens = debouncedSearchQuery.toLowerCase().split(',').map((t) => t.trim())
        return hasAllInArray(tokens, searchContent)
      })
    }
    if (selectedTags.length) {
        newFilteredMentors = newFilteredMentors.filter((mentor) =>
        hasAllInArray(selectedTags, mentor.tags)
      )
    }
    if (visibleMentorsCount) {
      newFilteredMentors = newFilteredMentors.slice(0, visibleMentorsCount)
    }
    setFilteredMentors(newFilteredMentors)
  }, [debouncedSearchQuery, selectedTags])

  // reset pagination on filters change
  useEffect(() => {
    setVisibleMentorsCount(pageSize)
  }, [debouncedSearchQuery, selectedTags])

  const showMoreMentors = () => {
    setVisibleMentorsCount(visibleMentorsCount + pageSize)
  }

  return {
    mentors: filteredMentors,
    searchQuery,
    setSearchQuery,
    selectedTags,
    setSelectedTags,
    hasMoreMentors: filteredMentors.length > visibleMentorsCount,
    showMoreMentors,
   }
}

/**
 * @param {string} value
 * @param {number} delay
 * @returns {string}
 */
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(timer)
    }
  }, [value])

  return debouncedValue
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
