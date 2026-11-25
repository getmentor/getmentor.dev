import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import MenteeDashboard from '@/components/mentee/MenteeDashboard'

const mockReplace = jest.fn()
jest.mock('next/router', () => ({
  useRouter: () => ({ query: {}, isReady: true, replace: mockReplace, push: jest.fn() }),
}))

const mockLogout = jest.fn()
jest.mock('@/components/mentee/MenteeAuthContext', () => ({
  useMenteeAuth: () => ({ isAuthenticated: true, isLoading: false, logout: mockLogout }),
}))

jest.mock('@/lib/mentee-api', () => ({
  getMenteeRequests: () => Promise.resolve([]),
  submitMenteeReview: jest.fn(),
  MenteeApiError: class extends Error {},
}))

jest.mock('@/lib/analytics', () => ({
  __esModule: true,
  default: { events: {}, event: jest.fn(), identify: jest.fn(), reset: jest.fn() },
}))

describe('MenteeDashboard logout', () => {
  beforeEach(() => jest.clearAllMocks())

  it('stays on the page and shows an error when logout fails', async () => {
    mockLogout.mockRejectedValueOnce(new Error('network'))
    render(<MenteeDashboard />)
    await userEvent.click(await screen.findByRole('button', { name: 'Выйти' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('Не удалось выйти')
    expect(mockReplace).not.toHaveBeenCalledWith('/mentee/login')
    expect(screen.getByRole('button', { name: 'Выйти' })).toBeEnabled()
  })

  it('redirects to login after a successful logout', async () => {
    mockLogout.mockResolvedValueOnce(undefined)
    render(<MenteeDashboard />)
    await userEvent.click(await screen.findByRole('button', { name: 'Выйти' }))
    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith('/mentee/login'))
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })
})
