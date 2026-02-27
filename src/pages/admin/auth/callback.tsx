import { useEffect, useState } from 'react'
import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleNotch, faCheckCircle, faTimesCircle } from '@fortawesome/free-solid-svg-icons'
import { AdminAuthProvider, useAdminAuth } from '@/components/admin-moderation'
import analytics from '@/lib/analytics'

type CallbackState = 'verifying' | 'success' | 'error'

function CallbackHandler(): JSX.Element {
  const router = useRouter()
  const { verifyLogin, isAuthenticated } = useAdminAuth()
  const [state, setState] = useState<CallbackState>('verifying')
  const [errorMessage, setErrorMessage] = useState<string>('')

  useEffect(() => {
    const token = router.query.token as string | undefined

    if (isAuthenticated) {
      router.replace('/admin/mentors/pending')
      return
    }

    if (!router.isReady) return

    if (!token) {
      analytics.event(analytics.events.ADMIN_AUTH_LOGIN_VERIFIED, {
        outcome: 'invalid_token',
      })
      router.replace('/admin/login?callback_error=invalid_token')
      return
    }

    const verify = async (): Promise<void> => {
      try {
        const result = await verifyLogin(token)
        if (result.success) {
          setState('success')
          analytics.event(analytics.events.ADMIN_AUTH_LOGIN_VERIFIED, {
            outcome: 'success',
          })
          setTimeout(() => {
            router.replace('/admin/mentors/pending')
          }, 1500)
        } else {
          setState('error')
          analytics.event(analytics.events.ADMIN_AUTH_LOGIN_VERIFIED, {
            outcome: 'error',
            error_type: 'invalid_token',
          })
          setErrorMessage(result.message || 'Недействительная или просроченная ссылка')
        }
      } catch {
        setState('error')
        analytics.event(analytics.events.ADMIN_AUTH_LOGIN_VERIFIED, {
          outcome: 'error',
          error_type: 'verification_failed',
        })
        setErrorMessage('Произошла ошибка при проверке ссылки')
      }
    }

    verify()
  }, [router, router.isReady, router.query.token, verifyLogin, isAuthenticated])

  return (
    <div className="flex min-h-screen flex-col justify-center bg-gray-50 py-12 sm:px-6 lg:px-8">
      <Head>
        <title>Вход в модерацию — getmentor.dev</title>
      </Head>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link href="/" className="mb-8 flex justify-center">
          <Image src="/images/logo.png" width={180} height={36} alt="getmentor.dev" />
        </Link>

        <div className="bg-white px-4 py-8 shadow-lg sm:rounded-lg sm:px-10">
          <div className="text-center">
            {state === 'verifying' && (
              <>
                <FontAwesomeIcon
                  icon={faCircleNotch}
                  className="mb-4 text-4xl text-indigo-500 animate-spin"
                />
                <h2 className="mb-2 text-lg font-medium text-gray-900">Проверяем ссылку...</h2>
                <p className="text-sm text-gray-600">Подождите, это займёт пару секунд</p>
              </>
            )}

            {state === 'success' && (
              <>
                <FontAwesomeIcon icon={faCheckCircle} className="mb-4 text-4xl text-green-500" />
                <h2 className="mb-2 text-lg font-medium text-gray-900">Вход выполнен!</h2>
                <p className="text-sm text-gray-600">Перенаправляем в панель модерации...</p>
              </>
            )}

            {state === 'error' && (
              <>
                <FontAwesomeIcon icon={faTimesCircle} className="mb-4 text-4xl text-red-500" />
                <h2 className="mb-2 text-lg font-medium text-gray-900">Не удалось войти</h2>
                <p className="mb-4 text-sm text-gray-600">{errorMessage}</p>
                <Link
                  href="/admin/login"
                  className="inline-flex items-center rounded-md border border-transparent bg-[#1A2238] px-4 py-2 text-sm font-medium text-white hover:opacity-90"
                >
                  Попробовать снова
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function AdminAuthCallbackPage(): JSX.Element {
  return (
    <AdminAuthProvider>
      <CallbackHandler />
    </AdminAuthProvider>
  )
}
