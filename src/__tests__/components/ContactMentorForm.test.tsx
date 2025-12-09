import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ContactMentorForm from '@/components/forms/ContactMentorForm'

// Mock ReCAPTCHA component
jest.mock('react-google-recaptcha', () => ({
  __esModule: true,
  default: function MockReCAPTCHA({ onChange }: { onChange: (token: string | null) => void }) {
    return (
      <button
        type="button"
        data-testid="recaptcha"
        onClick={() => onChange('mock-recaptcha-token')}
      >
        Complete ReCAPTCHA
      </button>
    )
  },
}))

describe('ContactMentorForm', () => {
  const mockOnSubmit = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders all required form fields', () => {
    render(<ContactMentorForm isLoading={false} isError={false} onSubmit={mockOnSubmit} />)

    expect(screen.getByLabelText(/Ваша почта/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Ваше имя и фамилия/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/О чём хотите поговорить/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Telegram @username/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Как вы оцениваете свой уровень/i)).toBeInTheDocument()
  })

  it('renders submit button', () => {
    render(<ContactMentorForm isLoading={false} isError={false} onSubmit={mockOnSubmit} />)

    expect(screen.getByRole('button', { name: /Отправить заявку/i })).toBeInTheDocument()
  })

  it('disables submit button when isLoading is true', () => {
    render(<ContactMentorForm isLoading={true} isError={false} onSubmit={mockOnSubmit} />)

    expect(screen.getByRole('button', { name: /Отправить заявку/i })).toBeDisabled()
  })

  it('displays error message when isError is true', () => {
    render(<ContactMentorForm isLoading={false} isError={true} onSubmit={mockOnSubmit} />)

    expect(screen.getByText(/Ошибка. Скорее всего мы уже чиним/i)).toBeInTheDocument()
  })

  it('shows validation error for empty required fields on submit', async () => {
    render(<ContactMentorForm isLoading={false} isError={false} onSubmit={mockOnSubmit} />)

    const submitButton = screen.getByRole('button', { name: /Отправить заявку/i })

    await act(async () => {
      fireEvent.click(submitButton)
    })

    await waitFor(() => {
      // Should show required field errors
      const requiredErrors = screen.getAllByText(/Это поле обязательно для заполнения/i)
      expect(requiredErrors.length).toBeGreaterThan(0)
    })

    // Form should not be submitted
    expect(mockOnSubmit).not.toHaveBeenCalled()
  })

  it('renders experience level dropdown with options', () => {
    render(<ContactMentorForm isLoading={false} isError={false} onSubmit={mockOnSubmit} />)

    const select = screen.getByLabelText(/Как вы оцениваете свой уровень/i)
    expect(select).toBeInTheDocument()

    // Check some options exist
    expect(screen.getByRole('option', { name: 'Junior' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Middle' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Senior' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'C-level' })).toBeInTheDocument()
  })

  it('renders recaptcha component', () => {
    render(<ContactMentorForm isLoading={false} isError={false} onSubmit={mockOnSubmit} />)

    expect(screen.getByTestId('recaptcha')).toBeInTheDocument()
  })

  it('allows selecting experience level', async () => {
    const user = userEvent.setup()
    render(<ContactMentorForm isLoading={false} isError={false} onSubmit={mockOnSubmit} />)

    const select = screen.getByLabelText(/Как вы оцениваете свой уровень/i)
    await user.selectOptions(select, 'Senior')

    expect(select).toHaveValue('Senior')
  })

  it('submits form with valid data', async () => {
    const user = userEvent.setup()
    render(<ContactMentorForm isLoading={false} isError={false} onSubmit={mockOnSubmit} />)

    // Fill all required fields
    await user.type(screen.getByLabelText(/Ваша почта/i), 'test@example.com')
    await user.type(screen.getByLabelText(/Ваше имя и фамилия/i), 'John Doe')
    await user.type(
      screen.getByLabelText(/О чём хотите поговорить/i),
      'I need help with my career development in tech industry.'
    )
    await user.type(screen.getByLabelText(/Telegram @username/i), '@johndoe')

    // Complete recaptcha
    await act(async () => {
      fireEvent.click(screen.getByTestId('recaptcha'))
    })

    // Submit form
    const submitButton = screen.getByRole('button', { name: /Отправить заявку/i })

    await act(async () => {
      fireEvent.click(submitButton)
    })

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledTimes(1)
    })

    expect(mockOnSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'test@example.com',
        name: 'John Doe',
        intro: 'I need help with my career development in tech industry.',
        telegramUsername: '@johndoe',
        recaptchaToken: 'mock-recaptcha-token',
      }),
      expect.anything() // react-hook-form passes event as second arg
    )
  })

  it('does not submit without recaptcha token', async () => {
    const user = userEvent.setup()
    render(<ContactMentorForm isLoading={false} isError={false} onSubmit={mockOnSubmit} />)

    // Fill all required fields except recaptcha
    await user.type(screen.getByLabelText(/Ваша почта/i), 'test@example.com')
    await user.type(screen.getByLabelText(/Ваше имя и фамилия/i), 'John Doe')
    await user.type(
      screen.getByLabelText(/О чём хотите поговорить/i),
      'I need help with my career development in tech industry.'
    )
    await user.type(screen.getByLabelText(/Telegram @username/i), '@johndoe')

    // Don't complete recaptcha - submit form
    const submitButton = screen.getByRole('button', { name: /Отправить заявку/i })

    await act(async () => {
      fireEvent.click(submitButton)
    })

    // Wait for validation to complete
    await waitFor(() => {
      // Form should not be submitted without recaptcha
      expect(mockOnSubmit).not.toHaveBeenCalled()
    })
  })
})
