import { render, screen, fireEvent, act } from '@testing-library/react'
import ConfirmModal from '@/components/ui/ConfirmModal'

describe('ConfirmModal', () => {
  it('enables confirm only after typing the exact value', async () => {
    const onConfirm = jest.fn().mockResolvedValue(undefined)
    render(
      <ConfirmModal
        isOpen
        title="Delete?"
        confirmLabel="Confirm delete"
        busyLabel="Deleting..."
        cancelLabel="Cancel"
        confirmationValue="ivan-1"
        confirmationLabel="Type slug"
        onConfirm={onConfirm}
        onClose={jest.fn()}
      >
        <p>Irreversible</p>
      </ConfirmModal>
    )

    const button = screen.getByRole('button', { name: 'Confirm delete' })
    const input = screen.getByLabelText('Type slug')
    expect(button).toBeDisabled()

    fireEvent.change(input, { target: { value: 'ivan-' } })
    expect(button).toBeDisabled()

    fireEvent.change(input, { target: { value: 'ivan-1' } })
    expect(button).toBeEnabled()

    await act(async () => {
      fireEvent.click(button)
    })
    expect(onConfirm).toHaveBeenCalledTimes(1)
  })

  it('shows the error when confirm fails', async () => {
    const onConfirm = jest.fn().mockRejectedValue(new Error('Slug does not match'))
    render(
      <ConfirmModal
        isOpen
        title="Restore?"
        confirmLabel="Restore"
        busyLabel="Restoring..."
        cancelLabel="Cancel"
        onConfirm={onConfirm}
        onClose={jest.fn()}
      >
        <p>Restore it</p>
      </ConfirmModal>
    )

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Restore' }))
    })
    expect(screen.getByText('Slug does not match')).toBeInTheDocument()
  })

  it('renders nothing when closed', () => {
    const { container } = render(
      <ConfirmModal
        isOpen={false}
        title="x"
        confirmLabel="ok"
        busyLabel="..."
        cancelLabel="no"
        onConfirm={jest.fn()}
        onClose={jest.fn()}
      >
        <p>x</p>
      </ConfirmModal>
    )
    expect(container).toBeEmptyDOMElement()
  })
})
