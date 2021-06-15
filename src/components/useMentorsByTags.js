import { useState, useEffect } from 'react'

export default function useMentorsByTags(allMentors, pageSize = 48) {
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
  const filteredMentors = (selectedTags.length)
    ? allMentors.filter(mentor => hasAllTags(mentor.tags, selectedTags))
    : allMentors

  const mentors = filteredMentors.slice(0, mentorsCount)
  const hasMoreMentors = (filteredMentors.length > mentorsCount)

  return [mentors, selectedTags, setSelectedTags, hasMoreMentors, showMoreMentors]
}
