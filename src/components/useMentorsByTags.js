import { useState, useEffect } from 'react'

export default function useMentorsByTags(allMentors, pageSize = 48) {
  const [searchInput, setSearchInput] = useState('')
  const [selectedTags, setSelectedTags] = useState([])
  const [mentorsCount, setMentorsCount] = useState(pageSize)

  // reset pagination on filters change
  useEffect(() => {
    setMentorsCount(pageSize)
  }, [selectedTags])

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
    filteredMentors = filteredMentors.filter(mentor => {
      const searchContent = mentor.name + ' ' + mentor.job + ' ' + mentor.description
      return searchContent.toLowerCase().includes(searchInput.toLowerCase())
    })
  }
  if (selectedTags.length) {
    filteredMentors = filteredMentors.filter(mentor => hasAllTags(mentor.tags, selectedTags))
  }

  const mentors = filteredMentors.slice(0, mentorsCount)
  const hasMoreMentors = (filteredMentors.length > mentorsCount)

  return [mentors, searchInput, selectedTags, hasMoreMentors, setSearchInput, setSelectedTags, showMoreMentors]
}
