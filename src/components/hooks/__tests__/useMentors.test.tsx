import { renderHook, act } from '@testing-library/react'
import useMentors from '@/components/hooks/useMentors'
import filters from '@/config/filters'
import type { MentorListItem } from '@/types'

const baseMentors: MentorListItem[] = [
  {
    id: 1,
    mentorId: 'rec1',
    slug: 'frontend-mentor',
    name: 'Frontend Mentor',
    job: 'FE',
    workplace: 'Company',
    description: 'Helps with React',
    about: 'Experienced in frontend',
    competencies: 'React, JS',
    experience: '5-10',
    price: '2000 руб',
    tags: ['Frontend', 'React'],
    menteeCount: 10,
    photo_url: null,
    sortOrder: 1,
    isVisible: true,
    isNew: false,
    calendarType: 'none',
  },
  {
    id: 2,
    mentorId: 'rec2',
    slug: 'backend-mentor',
    name: 'Backend Mentor',
    job: 'BE',
    workplace: 'Company',
    description: 'Helps with Go',
    about: 'Experienced in backend',
    competencies: 'Go, API',
    experience: '10+',
    price: '5000 руб',
    tags: ['Backend'],
    menteeCount: 0,
    photo_url: null,
    sortOrder: 2,
    isVisible: true,
    isNew: true,
    calendarType: 'none',
  },
]

describe('useMentors', () => {
  it('filters by search term', () => {
    const { result } = renderHook(() => useMentors(baseMentors, 10))

    act(() => {
      result.current[3]('React') // setSearchInput
    })

    const mentors = result.current[0]
    expect(mentors).toHaveLength(1)
    expect(mentors[0].slug).toBe('frontend-mentor')
  })

  it('filters by tags and experience mapping', () => {
    const { result } = renderHook(() => useMentors(baseMentors, 10))
    const experienceKey = Object.keys(filters.experience).find(
      (key) => filters.experience[key as keyof typeof filters.experience] === '10+'
    ) as string

    act(() => {
      result.current[5].tags.set(['Backend'])
      result.current[5].experience.set([experienceKey])
    })

    const mentors = result.current[0]
    expect(mentors).toHaveLength(1)
    expect(mentors[0].slug).toBe('backend-mentor')
  })

  it('filters by price and new/mentees flags with pagination', () => {
    const { result } = renderHook(() => useMentors(baseMentors, 1))

    act(() => {
      result.current[5].price.set('До 5 000 руб.')
      result.current[5].newMentor.set(true)
      result.current[5].noSessions.set(true)
    })

    // initial page size 1 should include backend mentor after filters
    expect(result.current[0]).toHaveLength(1)
    expect(result.current[0][0].slug).toBe('backend-mentor')

    act(() => {
      result.current[4]() // showMoreMentors
    })

    expect(result.current[2]).toBe(false) // hasMoreMentors
  })
})
