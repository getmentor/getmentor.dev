/**
 * Decline Modal component
 *
 * Modal dialog for declining a request with reason and optional comment.
 */

import { useState, useEffect, useRef } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleNotch, faTimes } from '@fortawesome/free-solid-svg-icons'
import type { DeclineReasonValue } from '@/types'
import { DECLINE_REASONS } from '@/types'

interface DeclineModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (reason: DeclineReasonValue, comment?: string) => Promise<void>
  menteName: string
}

export default function DeclineModal({
  isOpen,
  onClose,
  onConfirm,
  menteName,
}: DeclineModalProps): JSX.Element | null {
  const [reason, setReason] = useState<DeclineReasonValue | ''>('')
  const [comment, setComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const modalRef = useRef<HTMLDivElement>(null)
  const firstInputRef = useRef<HTMLSelectElement>(null)

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setReason('')
      setComment('')
      setError(null)
      // Focus first input when modal opens
      setTimeout(() => firstInputRef.current?.focus(), 100)
    }
  }, [isOpen])

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent): void => {
      if (e.key === 'Escape' && isOpen && !isSubmitting) {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, isSubmitting, onClose])

  // Handle click outside
  const handleBackdropClick = (e: React.MouseEvent): void => {
    if (e.target === e.currentTarget && !isSubmitting) {
      onClose()
    }
  }

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()

    if (!reason) {
      setError('Выберите причину отказа')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      await onConfirm(reason, comment.trim() || undefined)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto"
      aria-labelledby="decline-modal-title"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
        onClick={handleBackdropClick}
      />

      {/* Modal */}
      <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
        <div
          ref={modalRef}
          className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <h3 id="decline-modal-title" className="text-lg font-medium text-gray-900">
              Отклонить заявку
            </h3>
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="text-gray-400 hover:text-gray-500 disabled:opacity-50"
              aria-label="Закрыть"
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </div>

          {/* Content */}
          <form onSubmit={handleSubmit}>
            <div className="px-6 py-4 space-y-4">
              <p className="text-sm text-gray-600">
                Вы собираетесь отклонить заявку от <span className="font-medium">{menteName}</span>.
                Укажите причину отказа.
              </p>

              {/* Reason select */}
              <div>
                <label
                  htmlFor="decline-reason"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Причина отказа <span className="text-red-500">*</span>
                </label>
                <select
                  id="decline-reason"
                  ref={firstInputRef}
                  value={reason}
                  onChange={(e) => setReason(e.target.value as DeclineReasonValue)}
                  disabled={isSubmitting}
                  className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-gray-100"
                >
                  <option value="">Выберите причину</option>
                  {DECLINE_REASONS.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Comment textarea */}
              <div>
                <label
                  htmlFor="decline-comment"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Комментарий <span className="text-gray-400">(необязательно)</span>
                </label>
                <textarea
                  id="decline-comment"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  disabled={isSubmitting}
                  rows={3}
                  placeholder="Дополнительная информация для менти..."
                  className="block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-gray-100 placeholder-gray-400"
                />
              </div>

              {/* Error message */}
              {error && (
                <div className="p-3 rounded-md bg-red-50 border border-red-200">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                Отмена
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !reason}
                className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <FontAwesomeIcon icon={faCircleNotch} className="animate-spin mr-2" />
                    Отклонение...
                  </>
                ) : (
                  'Отклонить заявку'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
