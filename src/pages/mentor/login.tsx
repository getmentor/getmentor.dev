/**
 * Mentor Login Page
 *
 * Passwordless authentication using email + magic link/token.
 */

import { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/router'
import { useForm } from 'react-hook-form'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleNotch, faEnvelope } from '@fortawesome/free-solid-svg-icons'
import { MentorAuthProvider, useMentorAuth } from '@/components/mentor-admin'

interface LoginFormData {
  email: string
}

function LoginForm(): JSX.Element {
  const router = useRouter()
  const { isAuthenticated, isLoading: authLoading, requestLogin } = useMentorAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const { expired, callback_error } = router.query

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>()

  // Redirect if already authenticated
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.replace('/mentor')
    }
  }, [authLoading, isAuthenticated, router])

  const onSubmit = async (data: LoginFormData): Promise<void> => {
    setIsSubmitting(true)
    setSubmitError(null)

    try {
      const result = await requestLogin(data.email)
      if (result.success) {
        setSubmitSuccess(true)
      } else {
        setSubmitError(result.message || 'Произошла ошибка. Попробуйте ещё раз.')
      }
    } catch {
      setSubmitError('Произошла ошибка. Попробуйте ещё раз.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <FontAwesomeIcon icon={faCircleNotch} className="animate-spin text-indigo-500 text-2xl" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <Head>
        <title>Вход для менторов — getmentor.dev</title>
      </Head>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link href="/" className="flex justify-center mb-6">
          <Image src="/images/logo.png" width={180} height={36} alt="getmentor.dev" />
        </Link>
        <h2 className="text-center text-2xl font-semibold text-gray-900">Личный кабинет ментора</h2>
        <p className="mt-2 text-center text-sm text-gray-600">Войдите, чтобы управлять заявками</p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-lg sm:rounded-lg sm:px-10">
          {/* Session expired message */}
          {expired === 'true' && (
            <div className="mb-6 p-4 rounded-md bg-yellow-50 border border-yellow-200">
              <p className="text-sm text-yellow-800">Сессия истекла. Пожалуйста, войдите снова.</p>
            </div>
          )}

          {/* Callback error message */}
          {callback_error && (
            <div className="mb-6 p-4 rounded-md bg-red-50 border border-red-200">
              <p className="text-sm text-red-800">
                {callback_error === 'invalid_token'
                  ? 'Недействительная или просроченная ссылка. Запросите новую.'
                  : 'Произошла ошибка. Попробуйте ещё раз.'}
              </p>
            </div>
          )}

          {submitSuccess ? (
            /* Success state */
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                <FontAwesomeIcon icon={faEnvelope} className="text-green-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Проверьте почту</h3>
              <p className="text-sm text-gray-600 mb-4">
                Мы отправили ссылку для входа на указанный email. Перейдите по ней, чтобы войти в
                личный кабинет.
              </p>
              <p className="text-xs text-gray-500">
                Не получили письмо? Проверьте папку «Спам» или{' '}
                <button
                  onClick={() => setSubmitSuccess(false)}
                  className="text-indigo-600 hover:text-indigo-500"
                >
                  попробуйте ещё раз
                </button>
              </p>
            </div>
          ) : (
            /* Login form */
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <div className="mt-1">
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="mentor@example.com"
                    {...register('email', {
                      required: 'Введите email',
                      pattern: {
                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                        message: 'Введите корректный email',
                      },
                    })}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
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
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#1A2238] hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
              >
                {isSubmitting ? (
                  <>
                    <FontAwesomeIcon icon={faCircleNotch} className="animate-spin mr-2" />
                    Отправка...
                  </>
                ) : (
                  'Получить ссылку для входа'
                )}
              </button>
            </form>
          )}

          {/* Help text */}
          <div className="mt-6 border-t border-gray-200 pt-6">
            <p className="text-xs text-gray-500 text-center">
              Используйте email, который вы указали при регистрации как ментор. Если возникли
              проблемы,{' '}
              <a
                href="mailto:hello@getmentor.dev"
                className="text-indigo-600 hover:text-indigo-500"
              >
                напишите нам
              </a>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function MentorLoginPage(): JSX.Element {
  return (
    <MentorAuthProvider>
      <LoginForm />
    </MentorAuthProvider>
  )
}
