import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import RegisterMentorForm from '@/components/forms/RegisterMentorForm'

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

// Mock react-select to avoid issues with portal rendering
jest.mock('react-select', () => ({
  __esModule: true,
  default: function MockSelect({
    options,
    onChange,
    value,
  }: {
    options: Array<{ value: string; label: string }>
    onChange: (selected: Array<{ value: string; label: string }>) => void
    value: Array<{ value: string; label: string }>
  }) {
    return (
      <div data-testid="tags-select">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => {
              const isSelected = value.some((v) => v.value === option.value)
              if (isSelected) {
                onChange(value.filter((v) => v.value !== option.value))
              } else if (value.length < 5) {
                onChange([...value, option])
              }
            }}
          >
            {option.label} {value.some((v) => v.value === option.value) && '✓'}
          </button>
        ))}
      </div>
    )
  },
}))

// Mock Wysiwyg editor
jest.mock('@/components/forms/Wysiwyg', () => ({
  __esModule: true,
  default: function MockWysiwyg({
    content,
    onUpdate,
  }: {
    content: string
    onUpdate: (editor: { getHTML: () => string }) => void
  }) {
    return (
      <textarea
        value={content}
        onChange={(e) => onUpdate({ getHTML: () => e.target.value })}
        data-testid="wysiwyg"
      />
    )
  },
}))

describe('RegisterMentorForm', () => {
  const mockOnSubmit = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders all required form fields', () => {
    render(<RegisterMentorForm isLoading={false} isError={false} onSubmit={mockOnSubmit} />)

    expect(screen.getByLabelText(/Ваше имя и фамилия/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Ваша почта/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Telegram @username/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Должность/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Компания/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Опыт/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Цена за часовую встречу/i)).toBeInTheDocument()
    // Tags field uses Controller-wrapped Select, so check for label text instead
    expect(screen.getByText(/Специализация/i)).toBeInTheDocument()
    // Wysiwyg fields also use Controller, check for label text
    expect(screen.getByText(/Расскажите о себе/i)).toBeInTheDocument()
    expect(screen.getByText(/С чем вы можете помочь/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Навыки и технологии/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Фотография профиля/i)).toBeInTheDocument()
  })

  it('renders optional calendar URL field', () => {
    render(<RegisterMentorForm isLoading={false} isError={false} onSubmit={mockOnSubmit} />)

    expect(screen.getByLabelText(/Ссылка на запись в ваш календарь/i)).toBeInTheDocument()
  })

  it('renders submit button', () => {
    render(<RegisterMentorForm isLoading={false} isError={false} onSubmit={mockOnSubmit} />)

    expect(screen.getByRole('button', { name: /Отправить заявку/i })).toBeInTheDocument()
  })

  it('disables submit button when isLoading is true', () => {
    render(<RegisterMentorForm isLoading={true} isError={false} onSubmit={mockOnSubmit} />)

    expect(screen.getByRole('button', { name: /Отправляю/i })).toBeDisabled()
  })

  it('displays error message when isError is true', () => {
    render(<RegisterMentorForm isLoading={false} isError={true} onSubmit={mockOnSubmit} />)

    expect(screen.getByText(/Ошибка. Скорее всего мы уже чиним/i)).toBeInTheDocument()
  })

  it('shows validation error for empty required fields on submit', async () => {
    render(<RegisterMentorForm isLoading={false} isError={false} onSubmit={mockOnSubmit} />)

    // Complete ReCAPTCHA to enable submit button
    await act(async () => {
      fireEvent.click(screen.getByTestId('recaptcha'))
    })

    const submitButton = screen.getByRole('button', { name: /Отправить заявку/i })

    await act(async () => {
      fireEvent.click(submitButton)
    })

    // Form should not be submitted when fields are empty
    await waitFor(() => {
      expect(mockOnSubmit).not.toHaveBeenCalled()
    })
  })

  it('shows error for missing profile picture', async () => {
    const user = userEvent.setup()
    render(<RegisterMentorForm isLoading={false} isError={false} onSubmit={mockOnSubmit} />)

    // Fill all fields except profile picture
    await user.type(screen.getByLabelText(/Ваше имя и фамилия/i), 'John Doe')
    await user.type(screen.getByLabelText(/Ваша почта/i), 'john@example.com')
    await user.type(screen.getByLabelText(/Telegram @username/i), 'johndoe')
    await user.type(screen.getByLabelText(/Должность/i), 'Engineer')
    await user.type(screen.getByLabelText(/Компания/i), 'Tech Company')
    await user.selectOptions(screen.getByLabelText(/Опыт/i), '10+')
    await user.selectOptions(screen.getByLabelText(/Цена за часовую встречу/i), '5000 руб')

    // Complete recaptcha
    await act(async () => {
      fireEvent.click(screen.getByTestId('recaptcha'))
    })

    // Submit form
    const submitButton = screen.getByRole('button', { name: /Отправить заявку/i })
    await act(async () => {
      fireEvent.click(submitButton)
    })

    // Should not submit without profile picture
    expect(mockOnSubmit).not.toHaveBeenCalled()
  })

  it('renders experience dropdown with correct options', () => {
    render(<RegisterMentorForm isLoading={false} isError={false} onSubmit={mockOnSubmit} />)

    const select = screen.getByLabelText(/Опыт/i)
    expect(select).toBeInTheDocument()

    // Check options exist
    expect(screen.getByRole('option', { name: /2-5 лет/i })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: /5-10 лет/i })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: /10\+ лет/i })).toBeInTheDocument()
  })

  it('renders recaptcha component', () => {
    render(<RegisterMentorForm isLoading={false} isError={false} onSubmit={mockOnSubmit} />)

    expect(screen.getByTestId('recaptcha')).toBeInTheDocument()
  })

  it('disables submit button without recaptcha token', async () => {
    render(<RegisterMentorForm isLoading={false} isError={false} onSubmit={mockOnSubmit} />)

    const submitButton = screen.getByRole('button', { name: /Отправить заявку/i })

    // Submit button should be disabled without recaptcha
    expect(submitButton).toBeDisabled()
  })

  it('enables submit button after recaptcha completion', async () => {
    render(<RegisterMentorForm isLoading={false} isError={false} onSubmit={mockOnSubmit} />)

    const submitButton = screen.getByRole('button', { name: /Отправить заявку/i })

    // Initially disabled
    expect(submitButton).toBeDisabled()

    // Complete recaptcha
    await act(async () => {
      fireEvent.click(screen.getByTestId('recaptcha'))
    })

    await waitFor(() => {
      // Should be enabled after recaptcha
      expect(submitButton).not.toBeDisabled()
    })
  })

  it('displays preview for selected profile picture', async () => {
    render(<RegisterMentorForm isLoading={false} isError={false} onSubmit={mockOnSubmit} />)

    const file = new File(['fake-image'], 'profile.jpg', { type: 'image/jpeg' })
    const fileInput = screen.getByLabelText(/Фотография профиля/i) as HTMLInputElement

    // Mock FileReader
    const mockFileReader = {
      readAsDataURL: jest.fn(),
      onloadend: null as (() => void) | null,
      result: 'data:image/jpeg;base64,fake-image-data',
    }

    jest
      .spyOn(global, 'FileReader')
      .mockImplementation(() => mockFileReader as unknown as FileReader)

    await act(async () => {
      fireEvent.change(fileInput, { target: { files: [file] } })
    })

    // Trigger onloadend
    await act(async () => {
      if (mockFileReader.onloadend) {
        mockFileReader.onloadend()
      }
    })

    await waitFor(() => {
      expect(screen.getByText(/Фото выбрано:/i)).toBeInTheDocument()
    })

    jest.restoreAllMocks()
  })

  it('validates invalid email format', async () => {
    const user = userEvent.setup()
    render(<RegisterMentorForm isLoading={false} isError={false} onSubmit={mockOnSubmit} />)

    await user.type(screen.getByLabelText(/Ваша почта/i), 'invalid-email')

    await act(async () => {
      fireEvent.click(screen.getByTestId('recaptcha'))
    })

    const submitButton = screen.getByRole('button', { name: /Отправить заявку/i })
    await act(async () => {
      fireEvent.click(submitButton)
    })

    // Form should not be submitted with invalid email
    await waitFor(() => {
      expect(mockOnSubmit).not.toHaveBeenCalled()
    })
  })

  it('allows canceling selected image', async () => {
    render(<RegisterMentorForm isLoading={false} isError={false} onSubmit={mockOnSubmit} />)

    const file = new File(['fake-image'], 'profile.jpg', { type: 'image/jpeg' })
    const fileInput = screen.getByLabelText(/Фотография профиля/i) as HTMLInputElement

    const mockFileReader = {
      readAsDataURL: jest.fn(),
      onloadend: null as (() => void) | null,
      result: 'data:image/jpeg;base64,fake-image-data',
    }

    jest
      .spyOn(global, 'FileReader')
      .mockImplementation(() => mockFileReader as unknown as FileReader)

    await act(async () => {
      fireEvent.change(fileInput, { target: { files: [file] } })
    })

    await act(async () => {
      if (mockFileReader.onloadend) {
        mockFileReader.onloadend()
      }
    })

    await waitFor(() => {
      expect(screen.getByText(/Фото выбрано:/i)).toBeInTheDocument()
    })

    // Cancel the image
    const cancelButton = screen.getByRole('button', { name: /Отменить/i })
    await act(async () => {
      fireEvent.click(cancelButton)
    })

    await waitFor(() => {
      expect(screen.queryByText(/Фото выбрано:/i)).not.toBeInTheDocument()
    })

    jest.restoreAllMocks()
  })
})
