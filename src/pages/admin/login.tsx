import { useEffect, useState } from 'react'
import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useForm } from 'react-hook-form'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleNotch, faEnvelope } from '@fortawesome/free-solid-svg-icons'
import { AdminAuthProvider, useAdminAuth } from '@/components/admin-moderation'
import analytics from '@/lib/analytics'

interface LoginFormData {
  email: string
}

function LoginForm(): JSX.Element {
  const router = useRouter()
  const { isAuthenticated, isLoading: authLoading, requestLogin } = useAdminAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const { expired, callback_error } = router.query

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>()

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.replace('/admin/mentors/pending')
    }
  }, [authLoading, isAuthenticated, router])

  useEffect(() => {
    analytics.event(analytics.events.ADMIN_AUTH_LOGIN_REQUESTED, {
      outcome: 'login_page_viewed',
    })
  }, [])

  const onSubmit = async (data: LoginFormData): Promise<void> => {
    setIsSubmitting(true)
    setSubmitError(null)
    analytics.event(analytics.events.ADMIN_AUTH_LOGIN_REQUESTED, {
      outcome: 'submitted',
    })

    try {
      const result = await requestLogin(data.email)
      if (result.success) {
        setSubmitSuccess(true)
        analytics.event(analytics.events.ADMIN_AUTH_LOGIN_REQUESTED, {
          outcome: 'success',
        })
      } else {
        setSubmitError(result.message || 'Произошла ошибка. Попробуйте ещё раз.')
        analytics.event(analytics.events.ADMIN_AUTH_LOGIN_REQUESTED, {
          outcome: 'error',
          error_type: 'api_error',
        })
      }
    } catch {
      setSubmitError('Произошла ошибка. Попробуйте ещё раз.')
      analytics.event(analytics.events.ADMIN_AUTH_LOGIN_REQUESTED, {
        outcome: 'error',
        error_type: 'network_error',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <FontAwesomeIcon icon={faCircleNotch} className="animate-spin text-2xl text-indigo-500" />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col justify-center bg-gray-50 py-12 sm:px-6 lg:px-8">
      <Head>
        <title>Модерация — вход — getmentor.dev</title>
      </Head>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link href="/" className="mb-6 flex justify-center">
          <Image src="/images/logo.png" width={180} height={36} alt="getmentor.dev" />
        </Link>
        <h2 className="text-center text-2xl font-semibold text-gray-900">Панель модерации</h2>
        <p className="mt-2 text-center text-sm text-gray-600">Вход по одноразовой ссылке</p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white px-4 py-8 shadow-lg sm:rounded-lg sm:px-10">
          {expired === 'true' && (
            <div className="mb-6 rounded-md border border-yellow-200 bg-yellow-50 p-4">
              <p className="text-sm text-yellow-800">Сессия истекла. Пожалуйста, войдите снова.</p>
            </div>
          )}

          {callback_error && (
            <div className="mb-6 rounded-md border border-red-200 bg-red-50 p-4">
              <p className="text-sm text-red-800">
                {callback_error === 'invalid_token'
                  ? 'Недействительная или просроченная ссылка. Запросите новую.'
                  : 'Произошла ошибка. Попробуйте ещё раз.'}
              </p>
            </div>
          )}

          {submitSuccess ? (
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                <FontAwesomeIcon icon={faEnvelope} className="text-green-600" />
              </div>
              <h3 className="mb-2 text-lg font-medium text-gray-900">Проверьте почту</h3>
              <p className="mb-4 text-sm text-gray-600">
                Если email зарегистрирован как модераторский, ссылка для входа уже отправлена.
              </p>
              <button
                onClick={() => setSubmitSuccess(false)}
                className="text-xs text-indigo-600 hover:text-indigo-500"
              >
                Отправить снова
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="moderator@getmentor.dev"
                  {...register('email', {
                    required: 'Введите email',
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: 'Введите корректный email',
                    },
                  })}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                />
                {errors.email && (
                  <p className="mt-2 text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>

              {submitError && (
                <div className="rounded-md border border-red-200 bg-red-50 p-3">
                  <p className="text-sm text-red-600">{submitError}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-md bg-[#1A2238] px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <FontAwesomeIcon icon={faCircleNotch} className="mr-2 animate-spin" />
                    Отправка...
                  </>
                ) : (
                  'Получить ссылку для входа'
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

export default function AdminLoginPage(): JSX.Element {
  return (
    <AdminAuthProvider>
      <LoginForm />
    </AdminAuthProvider>
  )
}
