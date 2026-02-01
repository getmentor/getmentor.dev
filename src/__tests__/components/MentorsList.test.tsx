import { render, screen, fireEvent } from '@testing-library/react'
import MentorsList from '@/components/mentors/MentorsList'
import type { MentorListItem } from '@/types'

// Mock next/image - filter out Next.js-specific props
jest.mock('next/image', () => ({
  __esModule: true,
  default: function MockImage({
    alt,
    fill,
    unoptimized,
    blurDataURL,
    placeholder,
    sizes,
    ...props
  }: {
    alt: string
    fill?: boolean
    unoptimized?: boolean
    blurDataURL?: string
    placeholder?: string
    sizes?: string
    [key: string]: unknown
  }) {
    // Suppress unused variable warnings
    void fill
    void unoptimized
    void blurDataURL
    void placeholder
    void sizes
    // eslint-disable-next-line @next/next/no-img-element
    return <img alt={alt} {...props} />
  },
}))

// Mock next/link
jest.mock('next/link', () => ({
  __esModule: true,
  default: function MockLink({ children, href }: { children: React.ReactNode; href: string }) {
    return <a href={href}>{children}</a>
  },
}))

// Mock azure-image-loader
jest.mock('@/lib/azure-image-loader', () => ({
  imageLoader: ({ src, quality }: { src: string; quality: string }) =>
    `https://storage.example.com/${src}-${quality}.jpg`,
}))

const mockMentors: MentorListItem[] = [
  {
    id: 1,
    mentorId: 'rec1',
    slug: 'john-doe',
    name: 'John Doe',
    job: 'Senior Developer',
    workplace: 'Tech Corp',
    description: 'Expert in React',
    about: 'Full bio',
    competencies: 'React, TS',
    experience: '10+',
    price: '5000 руб',
    tags: ['Frontend'],
    menteeCount: 15,
    photo_url: null,
    sortOrder: 1,
    isVisible: true,
    isNew: false,
    calendarType: 'calendly',
  },
  {
    id: 2,
    mentorId: 'rec2',
    slug: 'jane-smith',
    name: 'Jane Smith',
    job: 'Tech Lead',
    workplace: 'StartupXYZ',
    description: 'Backend expert',
    about: 'Backend specialist',
    competencies: 'Go',
    experience: '5-10',
    price: '3000 руб',
    tags: ['Backend'],
    menteeCount: 0,
    photo_url: null,
    sortOrder: 2,
    isVisible: true,
    isNew: true,
    calendarType: 'koalendar',
  },
]

describe('MentorsList', () => {
  it('renders list of mentors', () => {
    render(<MentorsList mentors={mockMentors} hasMore={false} onClickMore={() => {}} />)

    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('Jane Smith')).toBeInTheDocument()
  })

  it('displays mentor job and workplace', () => {
    render(<MentorsList mentors={mockMentors} hasMore={false} onClickMore={() => {}} />)

    expect(screen.getByText('Senior Developer @ Tech Corp')).toBeInTheDocument()
    expect(screen.getByText('Tech Lead @ StartupXYZ')).toBeInTheDocument()
  })

  it('displays experience and price', () => {
    render(<MentorsList mentors={mockMentors} hasMore={false} onClickMore={() => {}} />)

    expect(screen.getByText('😎 10+ лет опыта')).toBeInTheDocument()
    expect(screen.getByText('💰 5000 руб')).toBeInTheDocument()
    expect(screen.getByText('😎 5-10 лет опыта')).toBeInTheDocument()
    expect(screen.getByText('💰 3000 руб')).toBeInTheDocument()
  })

  it('displays mentee count when greater than 0', () => {
    render(<MentorsList mentors={mockMentors} hasMore={false} onClickMore={() => {}} />)

    // John has 15 mentees
    expect(screen.getByText(/🤝 15/)).toBeInTheDocument()
    // Jane has 0 mentees - should not show
    expect(screen.queryByText(/🤝 0/)).not.toBeInTheDocument()
  })

  it('shows "New" badge for new mentors', () => {
    render(<MentorsList mentors={mockMentors} hasMore={false} onClickMore={() => {}} />)

    // Jane is new
    expect(screen.getByText('🎉 New')).toBeInTheDocument()
  })

  it('creates links to mentor detail pages', () => {
    render(<MentorsList mentors={mockMentors} hasMore={false} onClickMore={() => {}} />)

    const johnLink = screen.getByRole('link', { name: /John Doe/i })
    expect(johnLink).toHaveAttribute('href', '/mentor/john-doe')

    const janeLink = screen.getByRole('link', { name: /Jane Smith/i })
    expect(janeLink).toHaveAttribute('href', '/mentor/jane-smith')
  })

  it('shows "Load more" button when hasMore is true', () => {
    render(<MentorsList mentors={mockMentors} hasMore={true} onClickMore={() => {}} />)

    expect(screen.getByRole('button', { name: /Посмотреть ещё/i })).toBeInTheDocument()
  })

  it('hides "Load more" button when hasMore is false', () => {
    render(<MentorsList mentors={mockMentors} hasMore={false} onClickMore={() => {}} />)

    expect(screen.queryByRole('button', { name: /Посмотреть ещё/i })).not.toBeInTheDocument()
  })

  it('calls onClickMore when "Load more" button is clicked', () => {
    const mockOnClickMore = jest.fn()
    render(<MentorsList mentors={mockMentors} hasMore={true} onClickMore={mockOnClickMore} />)

    const button = screen.getByRole('button', { name: /Посмотреть ещё/i })
    fireEvent.click(button)

    expect(mockOnClickMore).toHaveBeenCalledTimes(1)
  })

  it('renders empty grid when no mentors provided', () => {
    render(<MentorsList mentors={[]} hasMore={false} onClickMore={() => {}} />)

    expect(screen.queryByRole('link')).not.toBeInTheDocument()
  })
})
