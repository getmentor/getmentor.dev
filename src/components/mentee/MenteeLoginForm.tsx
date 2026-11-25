/**
 * Mentee Login Page — passwordless login with a one-time emailed link.
 * Anyone who has sent a request can log in; there is no registration.
 */

import { useEffect, useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/router'
import { useForm } from 'react-hook-form'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleNotch, faEnvelope } from '@fortawesome/free-solid-svg-icons'
import { useMenteeAuth } from '@/components/mentee/MenteeAuthContext'
import { REPLAY_MASK_CLASS } from '@/components/mentee/MenteeRequestCard'
import analytics from '@/lib/analytics'

interface LoginFormData {
  email: string
}

export default function MenteeLoginForm(): JSX.Element {
  const router = useRouter()
  const { isAuthenticated, isLoading, requestLogin } = useMenteeAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [sentTo, setSentTo] = useState<string | null>(null)
  const { callback_error } = router.query
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>()

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace('/mentee')
    }
  }, [isLoading, isAuthenticated, router])

  useEffect(() => {
    analytics.event(analytics.events.MENTEE_AUTH_LOGIN_REQUESTED, { outcome: 'login_page_viewed' })
  }, [])

  const onSubmit = async (data: LoginFormData): Promise<void> => {
    setIsSubmitting(true)
    setSubmitError(null)
    analytics.event(analytics.events.MENTEE_AUTH_LOGIN_REQUESTED, { outcome: 'submitted' })
    try {
      const result = await requestLogin(data.email.trim())
      if (result.success) {
        setSentTo(data.email.trim())
        analytics.event(analytics.events.MENTEE_AUTH_LOGIN_REQUESTED, { outcome: 'success' })
      } else {
        setSubmitError(result.message || 'Произошла ошибка. Попробуйте ещё раз.')
        analytics.event(analytics.events.MENTEE_AUTH_LOGIN_REQUESTED, {
          outcome: 'error',
          error_type: 'api_error',
        })
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <FontAwesomeIcon icon={faCircleNotch} className="animate-spin text-indigo-500 text-2xl" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <Head>
        <title>Вход для учеников — getmentor.dev</title>
        <meta name="robots" content="noindex,nofollow" />
      </Head>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link href="/" className="flex justify-center mb-6">
          <Image src="/images/logo.png" width={180} height={36} alt="getmentor.dev" />
        </Link>
        <h2 className="text-center text-2xl font-semibold text-gray-900">Кабинет ученика</h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Войдите, чтобы посмотреть свои заявки менторам
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-lg sm:rounded-lg sm:px-10">
          {callback_error && (
            <div className="mb-6 p-4 rounded-md bg-red-50 border border-red-200">
              <p className="text-sm text-red-800">
                Недействительная или просроченная ссылка. Запросите новую.
              </p>
            </div>
          )}

          {sentTo ? (
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                <FontAwesomeIcon icon={faEnvelope} className="text-green-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Проверьте почту</h3>
              <p className="text-sm text-gray-600 mb-4">
                Если с адреса{' '}
                <span className={REPLAY_MASK_CLASS} data-testid="sent-to-email">
                  {sentTo}
                </span>{' '}
                отправлялись заявки, мы прислали на него ссылку для входа. Ссылка действует 15
                минут.
              </p>
              <p className="text-xs text-gray-500">
                Не получили письмо? Проверьте папку «Спам» или{' '}
                <button
                  onClick={() => setSentTo(null)}
                  className="text-indigo-600 hover:text-indigo-500"
                >
                  попробуйте ещё раз
                </button>
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <label htmlFor="mentee-email" className="block text-sm font-medium text-gray-700">
                  Email, с которого вы отправляли заявку
                </label>
                <input
                  id="mentee-email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  {...register('email', {
                    required: 'Введите email',
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: 'Введите корректный email',
                    },
                  })}
                  className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
                {errors.email && (
                  <p className="mt-2 text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>

              {submitError && (
                <div className="p-3 rounded-md bg-red-50 border border-red-200">
                  <p className="text-sm text-red-600">{submitError}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#1A2238] hover:opacity-90 disabled:opacity-50"
              >
                {isSubmitting ? 'Отправка...' : 'Получить ссылку для входа'}
              </button>
            </form>
          )}

          <div className="mt-6 border-t border-gray-200 pt-6">
            <p className="text-xs text-gray-500 text-center">
              Вы ментор?{' '}
              <Link href="/mentor/login" className="text-indigo-600 hover:text-indigo-500">
                Войти как ментор
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
