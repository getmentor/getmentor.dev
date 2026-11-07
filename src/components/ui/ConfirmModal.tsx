/**
 * Confirmation modal for destructive or important actions.
 *
 * When `confirmationValue` is set, the user must type it exactly
 * before the confirm button becomes active (e.g. the mentor slug for deletes).
 */

import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleNotch, faTimes } from '@fortawesome/free-solid-svg-icons'

interface ConfirmModalProps {
  isOpen: boolean
  title: string
  children: ReactNode
  confirmLabel: string
  busyLabel: string
  cancelLabel: string
  closeLabel?: string
  variant?: 'danger' | 'primary'
  /** Text the user must type to enable the confirm button */
  confirmationValue?: string
  confirmationLabel?: ReactNode
  fallbackErrorMessage?: string
  onConfirm: () => Promise<void>
  onClose: () => void
}

export default function ConfirmModal({
  isOpen,
  title,
  children,
  confirmLabel,
  busyLabel,
  cancelLabel,
  closeLabel = 'Close',
  variant = 'danger',
  confirmationValue,
  confirmationLabel,
  fallbackErrorMessage = 'Something went wrong',
  onConfirm,
  onClose,
}: ConfirmModalProps): JSX.Element | null {
  const [typedValue, setTypedValue] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const cancelRef = useRef<HTMLButtonElement>(null)

  const needsConfirmation = confirmationValue !== undefined
  const isConfirmed = !needsConfirmation || typedValue.trim() === confirmationValue

  // Reset state and focus when the modal opens
  useEffect(() => {
    if (!isOpen) return
    setTypedValue('')
    setError(null)
    const timer = setTimeout(() => {
      if (needsConfirmation) {
        inputRef.current?.focus()
      } else {
        cancelRef.current?.focus()
      }
    }, 100)
    return () => clearTimeout(timer)
  }, [isOpen, needsConfirmation])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent): void => {
      if (e.key === 'Escape' && isOpen && !isSubmitting) {
        onClose()
      }
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, isSubmitting, onClose])

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    if (!isConfirmed || isSubmitting) return

    setIsSubmitting(true)
    setError(null)
    try {
      await onConfirm()
    } catch (err) {
      setError(err instanceof Error ? err.message : fallbackErrorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  const confirmClasses =
    variant === 'danger'
      ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
      : 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500'

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto"
      aria-labelledby="confirm-modal-title"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
        onClick={() => !isSubmitting && onClose()}
      />

      <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
        <div className="relative w-full transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:max-w-lg">
          <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
            <h3 id="confirm-modal-title" className="text-lg font-medium text-gray-900">
              {title}
            </h3>
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="text-gray-400 hover:text-gray-500 disabled:opacity-50"
              aria-label={closeLabel}
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="space-y-4 px-6 py-4">
              <div className="space-y-2 text-sm text-gray-600">{children}</div>

              {needsConfirmation && (
                <div>
                  <label
                    htmlFor="confirm-modal-input"
                    className="mb-1 block text-sm font-medium text-gray-700"
                  >
                    {confirmationLabel}
                  </label>
                  <input
                    id="confirm-modal-input"
                    ref={inputRef}
                    type="text"
                    value={typedValue}
                    onChange={(e) => setTypedValue(e.target.value)}
                    disabled={isSubmitting}
                    autoComplete="off"
                    autoCapitalize="off"
                    spellCheck={false}
                    placeholder={confirmationValue}
                    className="block w-full rounded-md border border-gray-300 px-3 py-2 font-mono text-sm shadow-sm placeholder-gray-300 focus:border-red-500 focus:outline-none focus:ring-red-500 disabled:bg-gray-100"
                  />
                </div>
              )}

              {error && (
                <div className="rounded-md border border-red-200 bg-red-50 p-3">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-gray-200 bg-gray-50 px-6 py-4 sm:flex-row sm:justify-end">
              <button
                ref={cancelRef}
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 sm:w-auto"
              >
                {cancelLabel}
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !isConfirmed}
                className={`w-full rounded-md border border-transparent px-4 py-2 text-sm font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto ${confirmClasses}`}
              >
                {isSubmitting ? (
                  <>
                    <FontAwesomeIcon icon={faCircleNotch} className="mr-2 animate-spin" />
                    {busyLabel}
                  </>
                ) : (
                  confirmLabel
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
