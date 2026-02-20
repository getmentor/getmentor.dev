/**
 * New Review Page
 *
 * Allows mentees to submit feedback about their mentorship session.
 * URL: /reviews/new?request_id=<uuid>
 */

import { useState, useEffect, useRef } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { useForm } from 'react-hook-form'
import ReCAPTCHA from 'react-google-recaptcha'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faCircleNotch,
  faCheckCircle,
  faExclamationTriangle,
} from '@fortawesome/free-solid-svg-icons'

interface ReviewFormData {
  mentorReview: string
  platformReview: string
  improvements: string
  recaptchaToken: string
}

interface ReviewCheckResponse {
  canSubmit: boolean
  error?: string
  mentorName?: string
}

export default function NewReviewPage(): JSX.Element {
  const router = useRouter()
  const { request_id } = router.query
  const [isLoading, setIsLoading] = useState(false)
  const [isChecking, setIsChecking] = useState(true)
  const [isSuccess, setIsSuccess] = useState(false)
  const [checkError, setCheckError] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [mentorName, setMentorName] = useState<string>('')
  const recaptchaRef = useRef<ReCAPTCHA>(null)

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ReviewFormData>()

  // Check if review can be submitted
  useEffect(() => {
    if (!router.isReady) return

    const requestId = request_id as string
    if (!requestId) {
      setIsChecking(false)
      setCheckError('Некорректная ссылка — отсутствует идентификатор заявки')
      return
    }

    const checkReview = async (): Promise<void> => {
      try {
        const response = await fetch(
          `/api/reviews/check?request_id=${encodeURIComponent(requestId)}`
        )
        const data = (await response.json()) as ReviewCheckResponse

        if (!response.ok || !data.canSubmit) {
          setCheckError(data.error || 'Невозможно оставить отзыв для этой заявки')
          if (data.mentorName) {
            setMentorName(data.mentorName)
          }
        } else {
          setMentorName(data.mentorName || '')
        }
      } catch {
        setCheckError('Не удалось проверить заявку. Попробуйте позже.')
      } finally {
        setIsChecking(false)
      }
    }

    checkReview()
  }, [router.isReady, request_id])

  const handleCaptchaOnChange = (token: string | null): void => {
    setValue('recaptchaToken', token || '')
  }

  const onSubmit = async (data: ReviewFormData): Promise<void> => {
    if (!request_id) return

    setIsLoading(true)
    setSubmitError(null)

    try {
      const response = await fetch('/api/reviews/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestId: request_id,
          mentorReview: data.mentorReview,
          platformReview: data.platformReview || '',
          improvements: data.improvements || '',
          recaptchaToken: data.recaptchaToken,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Не удалось отправить отзыв')
      }

      setIsSuccess(true)
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Произошла ошибка')
      recaptchaRef.current?.reset()
      setValue('recaptchaToken', '')
    } finally {
      setIsLoading(false)
    }
  }

  const requiredText = 'Это поле обязательно для заполнения.'

  return (
    <>
      <Head>
        <title>Оставить отзыв — getmentor.dev</title>
        <meta name="robots" content="noindex,nofollow" />
      </Head>

      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
        <div className="max-w-2xl w-full">
          {/* Logo */}
          <div className="text-center mb-8">
            <a href="https://getmentor.dev" className="inline-block">
              <h1 className="text-3xl font-bold text-[#1A2238]">GetMentor.dev</h1>
            </a>
          </div>

          {/* Loading State */}
          {isChecking && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
              <FontAwesomeIcon
                icon={faCircleNotch}
                className="animate-spin text-gray-400 text-3xl mb-4"
              />
              <p className="text-gray-600">Загрузка...</p>
            </div>
          )}

          {/* Error State */}
          {!isChecking && checkError && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
              <div className="mb-4">
                <FontAwesomeIcon
                  icon={faExclamationTriangle}
                  className="text-yellow-500 text-5xl"
                />
              </div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">
                Не удалось открыть форму отзыва
              </h2>
              <p className="text-gray-600 mb-6">{checkError}</p>
              <a
                href="https://getmentor.dev"
                className="inline-block px-6 py-3 bg-[#1A2238] text-white font-medium rounded-md hover:opacity-90 transition-opacity"
              >
                Вернуться на главную
              </a>
            </div>
          )}

          {/* Success State */}
          {!isChecking && !checkError && isSuccess && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
              <div className="mb-4">
                <FontAwesomeIcon icon={faCheckCircle} className="text-green-500 text-5xl" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">Спасибо за отзыв!</h2>
              <p className="text-gray-600 mb-6">
                Ваш отзыв очень важен для нас. Он помогает менторам становиться лучше и позволяет
                нам улучшать сервис.
              </p>
              <a
                href="https://getmentor.dev"
                className="inline-block px-6 py-3 bg-[#1A2238] text-white font-medium rounded-md hover:opacity-90 transition-opacity"
              >
                Вернуться на главную
              </a>
            </div>
          )}

          {/* Form State */}
          {!isChecking && !checkError && !isSuccess && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                {mentorName
                  ? `Оставьте отзыв о встрече с ${mentorName}`
                  : 'Как прошла встреча с ментором?'}
              </h2>
              <p className="text-gray-600 mb-6">
                Мы рады, что вы воспользовались нашим сервисом. Пожалуйста, расскажите, как прошла
                встреча — ваша обратная связь очень важна для нас и для ментора.
              </p>

              <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                {/* Mentor Review (required) */}
                <div>
                  <label
                    htmlFor="mentorReview"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Отзыв о менторе <span className="text-red-500">*</span>
                  </label>

                  {errors.mentorReview?.type === 'required' && (
                    <div className="text-sm text-red-700 mb-2">{requiredText}</div>
                  )}
                  {errors.mentorReview?.type === 'minLength' && (
                    <div className="text-sm text-red-700 mb-2">
                      Минимальная длина отзыва — 10 символов.
                    </div>
                  )}
                  {errors.mentorReview?.type === 'maxLength' && (
                    <div className="text-sm text-red-700 mb-2">
                      Превышен лимит символов (не более 5000).
                    </div>
                  )}

                  <textarea
                    {...register('mentorReview', {
                      required: true,
                      minLength: 10,
                      maxLength: 5000,
                    })}
                    id="mentorReview"
                    rows={6}
                    placeholder="Расскажите, как прошла встреча: что вам понравилось, что было полезно, помог ли ментор..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-vertical"
                    disabled={isLoading}
                  />
                </div>

                {/* Platform Review (optional) */}
                <div>
                  <label
                    htmlFor="platformReview"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Отзыв о платформе
                  </label>

                  {errors.platformReview?.type === 'maxLength' && (
                    <div className="text-sm text-red-700 mb-2">
                      Превышен лимит символов (не более 5000).
                    </div>
                  )}

                  <textarea
                    {...register('platformReview', { maxLength: 5000 })}
                    id="platformReview"
                    rows={3}
                    placeholder="Что вы думаете о сервисе GetMentor? (необязательно)"
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-vertical"
                    disabled={isLoading}
                  />
                </div>

                {/* Improvements (optional) */}
                <div>
                  <label
                    htmlFor="improvements"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Что можно улучшить?
                  </label>

                  {errors.improvements?.type === 'maxLength' && (
                    <div className="text-sm text-red-700 mb-2">
                      Превышен лимит символов (не более 5000).
                    </div>
                  )}

                  <textarea
                    {...register('improvements', { maxLength: 5000 })}
                    id="improvements"
                    rows={3}
                    placeholder="Ваши предложения по улучшению (необязательно)"
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-vertical"
                    disabled={isLoading}
                  />
                </div>

                {/* ReCAPTCHA */}
                <input type="hidden" {...register('recaptchaToken', { required: true })} />

                {errors.recaptchaToken?.type === 'required' && (
                  <div className="text-sm text-red-700">
                    Пожалуйста, подтвердите, что вы не робот.
                  </div>
                )}

                <ReCAPTCHA
                  ref={recaptchaRef}
                  sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_V2_SITE_KEY || ''}
                  onChange={handleCaptchaOnChange}
                  hl="ru"
                />

                {/* Submit Error */}
                {submitError && (
                  <div className="p-4 rounded-md bg-red-50 border border-red-200">
                    <p className="text-sm text-red-600">{submitError}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full px-6 py-3 bg-[#1A2238] text-white font-medium rounded-md hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
                >
                  {isLoading ? (
                    <>
                      <FontAwesomeIcon icon={faCircleNotch} className="animate-spin mr-2" />
                      Отправка...
                    </>
                  ) : (
                    'Отправить отзыв'
                  )}
                </button>
              </form>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-500 text-center">
                  Если у вас возникли проблемы, напишите нам:{' '}
                  <a
                    href="mailto:hello@getmentor.dev"
                    className="text-indigo-600 hover:text-indigo-500"
                  >
                    hello@getmentor.dev
                  </a>
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
