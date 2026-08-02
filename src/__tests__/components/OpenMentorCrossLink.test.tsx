import { render, screen, fireEvent } from '@testing-library/react'
import OpenMentorCrossLink, { openmentorProfileUrl } from '@/components/mentors/OpenMentorCrossLink'
import analytics from '@/lib/analytics'

// analytics is PostHog-backed; mock it so the test doesn't reach the real client.
jest.mock('@/lib/analytics', () => ({
  __esModule: true,
  default: {
    event: jest.fn(),
    events: { OPENMENTOR_PROFILE_CLICKED: 'openmentor_profile_clicked' },
  },
}))

const mockedEvent = analytics.event as jest.Mock

describe('OpenMentorCrossLink', () => {
  beforeEach(() => {
    mockedEvent.mockClear()
  })

  it('links to the mentor profile on openmentor.io with referral attribution', () => {
    render(<OpenMentorCrossLink mentorName="Иван Петров" openmentorSlug="ivan-petrov-7" />)

    const link = screen.getByTestId('openmentor-cross-link')
    const href = link.getAttribute('href') as string

    expect(href).toContain('https://openmentor.io/mentor/ivan-petrov-7')
    expect(href).toContain('utm_source=getmentor.dev')
    expect(href).toContain('utm_medium=referral')
    expect(href).toContain('utm_campaign=mentor-crosslink')
  })

  // The link exists to pass equity to openmentor.io, so these absences are the
  // feature, not an oversight — a nofollow or a JS-only handler would defeat it.
  it('stays crawlable: no nofollow, no target, same tab', () => {
    render(<OpenMentorCrossLink mentorName="Иван Петров" openmentorSlug="ivan-petrov-7" />)

    const link = screen.getByTestId('openmentor-cross-link')
    expect(link.getAttribute('rel')).toBeNull()
    expect(link.getAttribute('target')).toBeNull()
  })

  it('addresses the mentor by first name and shows the OpenMentor logo', () => {
    render(<OpenMentorCrossLink mentorName="Иван Петров" openmentorSlug="ivan-petrov-7" />)

    expect(screen.getByText('Иван')).toBeInTheDocument()
    expect(screen.getByAltText('OpenMentor')).toHaveAttribute(
      'src',
      '/images/openmentor/logo-horizontal-dark.svg'
    )
  })

  it('falls back to the whole name when there is no space to split on', () => {
    render(<OpenMentorCrossLink mentorName="Cher" openmentorSlug="cher-1" />)

    expect(screen.getByText('Cher')).toBeInTheDocument()
  })

  it('reports the click to analytics', () => {
    render(<OpenMentorCrossLink mentorName="Иван Петров" openmentorSlug="ivan-petrov-7" />)

    fireEvent.click(screen.getByTestId('openmentor-cross-link'))

    expect(mockedEvent).toHaveBeenCalledWith('openmentor_profile_clicked', {
      openmentor_slug: 'ivan-petrov-7',
    })
  })

  // JSON-LD `sameAs` must identify the page, not link to it, so the canonical
  // helper has to stay UTM-free even though the visible href does not.
  it('exposes a UTM-free canonical URL for sameAs', () => {
    expect(openmentorProfileUrl('ivan-petrov-7')).toBe('https://openmentor.io/mentor/ivan-petrov-7')
  })
})
