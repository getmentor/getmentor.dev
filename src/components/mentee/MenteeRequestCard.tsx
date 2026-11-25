/**
 * One request on the mentee dashboard.
 *
 * Privacy rules (session replay records the DOM and its attributes verbatim):
 * - the request id never goes into the DOM (no id/htmlFor/data-* from it); form ids come from useId()
 * - free text the mentee or mentor wrote (request, decline comment, review) is inside `ph-mask`
 * - the server already strips mentor contacts; the calendar link is shown only if it is http(s)
 */

import { useId, useRef, useState } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import ReCAPTCHA from 'react-google-recaptcha'
import classNames from 'classnames'
import type { MenteeDashboardRequest, MenteeReviewPayload } from '@/types'
import { MENTEE_DECLINE_REASON_LABELS, MENTEE_STATUS_LABELS } from '@/types'
import { formatDate } from '@/components/mentor-admin/utils'

/** Session-replay class that masks text content (posthog-js maskTextClass default). */
export const REPLAY_MASK_CLASS = 'ph-mask'

export function safeHttpUrl(raw: string | null | undefined): string | null {
  if (!raw) return null
  try {
    const url = new URL(raw)
    return url.protocol === 'http:' || url.protocol === 'https:' ? url.toString() : null
  } catch {
    return null
  }
}

const STATUS_BADGE: Record<MenteeDashboardRequest['group'], string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  active: 'bg-blue-100 text-blue-800',
  done: 'bg-green-100 text-green-800',
  closed: 'bg-gray-100 text-gray-700',
}

interface ReviewFormProps {
  onSubmit: (payload: MenteeReviewPayload) => Promise<void>
}

function ReviewForm({ onSubmit }: ReviewFormProps): JSX.Element {
  const formId = useId()
  const recaptchaRef = useRef<ReCAPTCHA>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<MenteeReviewPayload>()

  const submit = async (data: MenteeReviewPayload): Promise<void> => {
    setIsSubmitting(true)
    setSubmitError(null)
    try {
      await onSubmit({
        mentorReview: data.mentorReview,
        platformReview: data.platformReview || '',
        improvements: data.improvements || '',
        recaptchaToken: data.recaptchaToken,
      })
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Не удалось отправить отзыв')
      recaptchaRef.current?.reset()
      setValue('recaptchaToken', '')
    } finally {
      setIsSubmitting(false)
    }
  }

  const textareaClass =
    'w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500'

  return (
    <form className="space-y-4 mt-4" onSubmit={handleSubmit(submit)}>
      <div>
        <label
          htmlFor={`${formId}-mentor`}
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Отзыв о менторе <span className="text-red-500">*</span>
        </label>
        {errors.mentorReview?.type === 'required' && (
          <p className="text-sm text-red-700 mb-1">Это поле обязательно для заполнения.</p>
        )}
        {errors.mentorReview?.type === 'minLength' && (
          <p className="text-sm text-red-700 mb-1">Минимальная длина отзыва — 10 символов.</p>
        )}
        {errors.mentorReview?.type === 'maxLength' && (
          <p className="text-sm text-red-700 mb-1">Превышен лимит символов (не более 5000).</p>
        )}
        <textarea
          id={`${formId}-mentor`}
          rows={5}
          className={textareaClass}
          placeholder="Расскажите, как прошла встреча: что было полезно, помог ли ментор..."
          disabled={isSubmitting}
          {...register('mentorReview', { required: true, minLength: 10, maxLength: 5000 })}
        />
      </div>
      <div>
        <label
          htmlFor={`${formId}-platform`}
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Отзыв о платформе
        </label>
        {errors.platformReview?.type === 'maxLength' && (
          <p className="text-sm text-red-700 mb-1">Превышен лимит символов (не более 5000).</p>
        )}
        <textarea
          id={`${formId}-platform`}
          rows={3}
          className={textareaClass}
          placeholder="Что вы думаете о сервисе GetMentor? (необязательно)"
          disabled={isSubmitting}
          {...register('platformReview', { maxLength: 5000 })}
        />
      </div>
      <div>
        <label
          htmlFor={`${formId}-improvements`}
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Что можно улучшить?
        </label>
        {errors.improvements?.type === 'maxLength' && (
          <p className="text-sm text-red-700 mb-1">Превышен лимит символов (не более 5000).</p>
        )}
        <textarea
          id={`${formId}-improvements`}
          rows={3}
          className={textareaClass}
          placeholder="Ваши предложения по улучшению (необязательно)"
          disabled={isSubmitting}
          {...register('improvements', { maxLength: 5000 })}
        />
      </div>

      <input type="hidden" {...register('recaptchaToken', { required: true })} />
      {errors.recaptchaToken?.type === 'required' && (
        <p className="text-sm text-red-700">Пожалуйста, подтвердите, что вы не робот.</p>
      )}
      <ReCAPTCHA
        ref={recaptchaRef}
        sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_V2_SITE_KEY || ''}
        onChange={(token: string | null) => setValue('recaptchaToken', token || '')}
      />

      {submitError && (
        <div className="p-3 rounded-md bg-red-50 border border-red-200">
          <p className="text-sm text-red-600">{submitError}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="px-5 py-2 bg-[#1A2238] text-white text-sm font-medium rounded-md hover:opacity-90 disabled:opacity-50"
      >
        {isSubmitting ? 'Отправка...' : 'Отправить отзыв'}
      </button>
    </form>
  )
}

interface MenteeRequestCardProps {
  request: MenteeDashboardRequest
  onSubmitReview: (request: MenteeDashboardRequest, payload: MenteeReviewPayload) => Promise<void>
}

export default function MenteeRequestCard({
  request,
  onSubmitReview,
}: MenteeRequestCardProps): JSX.Element {
  const [showForm, setShowForm] = useState(false)
  const calendarUrl =
    request.group === 'pending' || request.group === 'active'
      ? safeHttpUrl(request.mentor?.calendarUrl)
      : null
  const changedAt = request.statusChangedAt || null

  return (
    <article className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <h3 className="text-base font-semibold text-gray-900">
          {request.mentor ? (
            request.mentor.slug ? (
              <Link
                href={`/mentor/${encodeURIComponent(request.mentor.slug)}`}
                className="text-indigo-700 hover:text-indigo-900"
              >
                {request.mentor.name}
              </Link>
            ) : (
              request.mentor.name
            )
          ) : (
            <span className="text-gray-500">Ментор больше не на платформе</span>
          )}
        </h3>
        <span
          className={classNames(
            'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
            STATUS_BADGE[request.group]
          )}
        >
          {MENTEE_STATUS_LABELS[request.status] || request.status}
        </span>
      </div>

      <dl className="mt-2 flex flex-wrap gap-x-6 gap-y-1 text-xs text-gray-500">
        <div>
          <dt className="inline">Отправлена: </dt>
          <dd className="inline">{formatDate(request.createdAt)}</dd>
        </div>
        {changedAt && (
          <div>
            <dt className="inline">Статус изменён: </dt>
            <dd className="inline">{formatDate(changedAt)}</dd>
          </div>
        )}
      </dl>

      {request.details && (
        <div className="mt-3">
          <p className="text-xs font-medium text-gray-500 mb-1">Ваш запрос</p>
          <p className={classNames(REPLAY_MASK_CLASS, 'text-sm text-gray-800 whitespace-pre-line')}>
            {request.details}
          </p>
        </div>
      )}

      {request.group === 'closed' && (request.declineReason || request.declineComment) && (
        <div className="mt-3 p-3 rounded-md bg-gray-50 border border-gray-200 text-sm">
          {request.declineReason && (
            <p className="text-gray-700">
              Причина:{' '}
              {MENTEE_DECLINE_REASON_LABELS[request.declineReason] || request.declineReason}
            </p>
          )}
          {request.declineComment && (
            <p className={classNames(REPLAY_MASK_CLASS, 'mt-1 text-gray-600 whitespace-pre-line')}>
              {request.declineComment}
            </p>
          )}
        </div>
      )}

      {calendarUrl && (
        <a
          href={calendarUrl}
          target="_blank"
          rel="noopener noreferrer nofollow"
          className="mt-4 inline-block px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
        >
          Выбрать время в календаре ментора
        </a>
      )}

      {request.review && (
        <details className="mt-4">
          <summary className="cursor-pointer text-sm font-medium text-indigo-700">
            Посмотреть ваш отзыв
          </summary>
          <div className={classNames(REPLAY_MASK_CLASS, 'mt-2 space-y-2 text-sm text-gray-700')}>
            {request.review.mentorReview && (
              <p className="whitespace-pre-line">{request.review.mentorReview}</p>
            )}
            {request.review.platformReview && (
              <p className="whitespace-pre-line">
                <span className="text-gray-500">О платформе: </span>
                {request.review.platformReview}
              </p>
            )}
            {request.review.improvements && (
              <p className="whitespace-pre-line">
                <span className="text-gray-500">Что улучшить: </span>
                {request.review.improvements}
              </p>
            )}
          </div>
        </details>
      )}

      {request.canReview && !request.review && (
        <div className="mt-4">
          {showForm ? (
            <ReviewForm onSubmit={(payload) => onSubmitReview(request, payload)} />
          ) : (
            <button
              type="button"
              onClick={() => setShowForm(true)}
              className="px-4 py-2 text-sm font-medium text-indigo-700 border border-indigo-300 rounded-md hover:bg-indigo-50"
            >
              Оставить отзыв
            </button>
          )}
        </div>
      )}
    </article>
  )
}
