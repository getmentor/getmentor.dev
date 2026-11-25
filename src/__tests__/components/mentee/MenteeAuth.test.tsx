import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MenteeAuthProvider, useMenteeAuth } from '@/components/mentee/MenteeAuthContext'
import MenteeLoginForm from '@/components/mentee/MenteeLoginForm'

const mockReplace = jest.fn()
jest.mock('next/router', () => ({
  useRouter: () => ({ query: {}, isReady: true, replace: mockReplace, push: jest.fn() }),
}))

const mockReset = jest.fn()
const mockIdentify = jest.fn()
const mockEvent = jest.fn()
jest.mock('@/lib/analytics', () => ({
  __esModule: true,
  default: {
    events: new Proxy({}, { get: (_t, key) => String(key).toLowerCase() }),
    event: (...args: unknown[]) => mockEvent(...args),
    identify: (...args: unknown[]) => mockIdentify(...args),
    reset: () => mockReset(),
  },
}))

const mockGetSession = jest.fn()
const mockLogout = jest.fn()
const mockRequestLogin = jest.fn()
jest.mock('@/lib/mentee-api', () => ({
  getMenteeSession: () => mockGetSession(),
  logoutMentee: () => mockLogout(),
  requestMenteeLogin: (email: string) => mockRequestLogin(email),
  verifyMenteeLogin: jest.fn(),
}))

function LogoutButton(): JSX.Element {
  const { logout, isAuthenticated } = useMenteeAuth()
  return (
    <button onClick={() => logout()} disabled={!isAuthenticated}>
      logout
    </button>
  )
}

describe('MenteeAuthProvider', () => {
  beforeEach(() => jest.clearAllMocks())

  it('identifies by mentee id and resets analytics identity on logout', async () => {
    mockGetSession.mockResolvedValue({ mentee_id: 'mentee-1', exp: 9e9, iat: 1 })
    mockLogout.mockResolvedValue(undefined)
    render(
      <MenteeAuthProvider>
        <LogoutButton />
      </MenteeAuthProvider>
    )
    await waitFor(() => expect(screen.getByRole('button')).toBeEnabled())
    expect(mockIdentify).toHaveBeenCalledWith('mentee:mentee-1', { role: 'mentee' })
    expect(mockReset).not.toHaveBeenCalled()

    await userEvent.click(screen.getByRole('button'))
    await waitFor(() => expect(mockReset).toHaveBeenCalledTimes(1))
    expect(mockLogout).toHaveBeenCalledTimes(1)
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('keeps the session and analytics identity when the logout call fails', async () => {
    mockGetSession.mockResolvedValue({ mentee_id: 'mentee-1', exp: 9e9, iat: 1 })
    mockLogout.mockRejectedValue(new Error('network'))
    const ctx = {} as { current: ReturnType<typeof useMenteeAuth> }
    function Grab(): null {
      ctx.current = useMenteeAuth()
      return null
    }
    render(
      <MenteeAuthProvider>
        <Grab />
      </MenteeAuthProvider>
    )
    await waitFor(() => expect(mockIdentify).toHaveBeenCalled())
    let thrown: unknown = null
    await act(async () => {
      await ctx.current.logout().catch((e: unknown) => {
        thrown = e
      })
    })
    expect(thrown).toBeInstanceOf(Error)
    expect(mockReset).not.toHaveBeenCalled()
    expect(ctx.current.isAuthenticated).toBe(true)
  })
})

describe('MenteeLoginForm', () => {
  beforeEach(() => jest.clearAllMocks())

  it('masks the echoed email on the "check your inbox" screen', async () => {
    mockGetSession.mockResolvedValue(null)
    mockRequestLogin.mockResolvedValue({ success: true, message: 'ok' })
    render(
      <MenteeAuthProvider>
        <MenteeLoginForm />
      </MenteeAuthProvider>
    )
    await userEvent.type(await screen.findByLabelText(/Email/), 'private.person@example.com')
    await userEvent.click(screen.getByRole('button', { name: 'Получить ссылку для входа' }))

    const echoed = await screen.findByTestId('sent-to-email')
    expect(echoed).toHaveTextContent('private.person@example.com')
    expect(echoed).toHaveClass('ph-mask')
    expect(mockRequestLogin).toHaveBeenCalledWith('private.person@example.com')
    // the email never reaches analytics
    expect(JSON.stringify(mockEvent.mock.calls)).not.toContain('private.person')
  })
})
