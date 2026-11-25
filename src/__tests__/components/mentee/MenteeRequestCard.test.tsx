import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import MenteeRequestCard, { safeHttpUrl } from '@/components/mentee/MenteeRequestCard'
import type { MenteeDashboardRequest } from '@/types'

jest.mock('react-google-recaptcha', () => ({
  __esModule: true,
  default: function MockReCAPTCHA({ onChange }: { onChange: (token: string | null) => void }) {
    return (
      <button type="button" onClick={() => onChange('captcha-token')}>
        captcha
      </button>
    )
  },
}))

const REQUEST_ID = 'a1b2c3d4-0000-4000-8000-123456789abc'

function makeRequest(overrides: Partial<MenteeDashboardRequest> = {}): MenteeDashboardRequest {
  return {
    id: REQUEST_ID,
    status: 'pending',
    group: 'pending',
    details: 'Хочу разобраться с Go',
    createdAt: '2026-11-01T10:00:00Z',
    statusChangedAt: '2026-11-02T10:00:00Z',
    declineReason: null,
    declineComment: null,
    mentor: { name: 'Анна', slug: 'anna', calendarUrl: 'https://calendly.com/anna' },
    canReview: false,
    review: null,
    ...overrides,
  }
}

const noop = jest.fn()

describe('MenteeRequestCard', () => {
  it('links the mentor name to the public profile only when a slug is given', () => {
    const { rerender } = render(<MenteeRequestCard request={makeRequest()} onSubmitReview={noop} />)
    expect(screen.getByRole('link', { name: 'Анна' })).toHaveAttribute('href', '/mentor/anna')

    rerender(
      <MenteeRequestCard
        request={makeRequest({ mentor: { name: 'Анна', slug: null, calendarUrl: null } })}
        onSubmitReview={noop}
      />
    )
    expect(screen.queryByRole('link', { name: 'Анна' })).not.toBeInTheDocument()
    expect(screen.getByText('Анна')).toBeInTheDocument()
  })

  it('shows the calendar link for pending/active requests when present', () => {
    render(<MenteeRequestCard request={makeRequest()} onSubmitReview={noop} />)
    expect(screen.getByRole('link', { name: /календаре/ })).toHaveAttribute(
      'href',
      'https://calendly.com/anna'
    )
  })

  it('shows no calendar link when there is none, it is not http(s), or the request is closed', () => {
    const cases: Partial<MenteeDashboardRequest>[] = [
      { mentor: { name: 'Анна', slug: 'anna', calendarUrl: null } },
      { mentor: { name: 'Анна', slug: 'anna', calendarUrl: 'javascript:alert(1)' } },
      { status: 'declined', group: 'closed' },
      { status: 'done', group: 'done' },
    ]
    for (const c of cases) {
      const { unmount } = render(
        <MenteeRequestCard request={makeRequest(c)} onSubmitReview={noop} />
      )
      expect(screen.queryByRole('link', { name: /календаре/ })).not.toBeInTheDocument()
      unmount()
    }
  })

  it('shows a deleted mentor anonymously with no review option', () => {
    render(
      <MenteeRequestCard
        request={makeRequest({ status: 'done', group: 'done', mentor: null, canReview: false })}
        onSubmitReview={noop}
      />
    )
    expect(screen.getByText('Ментор больше не на платформе')).toBeInTheDocument()
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Оставить отзыв' })).not.toBeInTheDocument()
  })

  it('shows decline reason and masked comment for closed requests', () => {
    const { container } = render(
      <MenteeRequestCard
        request={makeRequest({
          status: 'declined',
          group: 'closed',
          declineReason: 'no_time',
          declineComment: 'Сейчас очень занят',
        })}
        onSubmitReview={noop}
      />
    )
    expect(screen.getByText(/Нет времени/)).toBeInTheDocument()
    expect(screen.getByText('Сейчас очень занят')).toHaveClass('ph-mask')
    expect(screen.queryByRole('button', { name: 'Оставить отзыв' })).not.toBeInTheDocument()
    expect(container.innerHTML).not.toContain(REQUEST_ID)
  })

  it('shows an existing review read-only', () => {
    render(
      <MenteeRequestCard
        request={makeRequest({
          status: 'done',
          group: 'done',
          canReview: false,
          review: {
            mentorReview: 'Спасибо!',
            platformReview: '',
            improvements: '',
            createdAt: null,
          },
        })}
        onSubmitReview={noop}
      />
    )
    expect(screen.getByText('Посмотреть ваш отзыв')).toBeInTheDocument()
    expect(screen.getByText('Спасибо!').closest('.ph-mask')).not.toBeNull()
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Оставить отзыв' })).not.toBeInTheDocument()
  })

  it('masks the request text', () => {
    render(<MenteeRequestCard request={makeRequest()} onSubmitReview={noop} />)
    expect(screen.getByText('Хочу разобраться с Go')).toHaveClass('ph-mask')
  })

  it('submits a review with the id passed in memory, never rendered into the DOM', async () => {
    const onSubmit = jest.fn().mockResolvedValue(undefined)
    const request = makeRequest({ status: 'done', group: 'done', canReview: true })
    const { container } = render(<MenteeRequestCard request={request} onSubmitReview={onSubmit} />)

    await userEvent.click(screen.getByRole('button', { name: 'Оставить отзыв' }))
    await userEvent.type(screen.getByLabelText(/Отзыв о менторе/), 'Очень полезная встреча')
    await userEvent.click(screen.getByRole('button', { name: 'captcha' }))

    // ids/htmlFor exist and come from useId, not from the request id
    const label = screen.getByText(/Отзыв о менторе/).closest('label')
    expect(label?.getAttribute('for')).toBeTruthy()
    expect(container.innerHTML).not.toContain(REQUEST_ID)

    await userEvent.click(screen.getByRole('button', { name: 'Отправить отзыв' }))
    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1))
    expect(onSubmit.mock.calls[0][0].id).toBe(REQUEST_ID)
    expect(onSubmit.mock.calls[0][1]).toEqual({
      mentorReview: 'Очень полезная встреча',
      platformReview: '',
      improvements: '',
      recaptchaToken: 'captcha-token',
    })
  })

  it('requires the same review fields as the emailed review form', async () => {
    const onSubmit = jest.fn()
    render(
      <MenteeRequestCard
        request={makeRequest({ status: 'done', group: 'done', canReview: true })}
        onSubmitReview={onSubmit}
      />
    )
    await userEvent.click(screen.getByRole('button', { name: 'Оставить отзыв' }))
    await userEvent.type(screen.getByLabelText(/Отзыв о менторе/), 'коротко')
    await userEvent.click(screen.getByRole('button', { name: 'Отправить отзыв' }))
    expect(await screen.findByText(/Минимальная длина отзыва/)).toBeInTheDocument()
    expect(screen.getByText(/не робот/)).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
  })
})

describe('safeHttpUrl', () => {
  it('accepts only http(s) URLs', () => {
    expect(safeHttpUrl('https://cal.example/x')).toBe('https://cal.example/x')
    expect(safeHttpUrl('http://cal.example/x')).toBe('http://cal.example/x')
    expect(safeHttpUrl('javascript:alert(1)')).toBeNull()
    expect(safeHttpUrl('data:text/html,hi')).toBeNull()
    expect(safeHttpUrl('cal.example')).toBeNull()
    expect(safeHttpUrl(null)).toBeNull()
  })
})
