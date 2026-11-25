/**
 * Mentor Auth Callback Page
 *
 * Handles magic link verification and creates session.
 */

import { useEffect, useRef, useState } from 'react'
import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleNotch, faCheckCircle, faTimesCircle } from '@fortawesome/free-solid-svg-icons'
import { MentorAuthProvider, useMentorAuth } from '@/components/mentor-admin'
import analytics from '@/lib/analytics'
import { loginCallbackServerSideProps, MENTOR_LOGIN_TOKEN } from '@/lib/login-token-handoff'

// Moves ?token= into an HttpOnly cookie server-side and redirects without it, so no browser
// script (PostHog, Faro, GTM record the URL on load) ever sees the token.
export const getServerSideProps = loginCallbackServerSideProps(MENTOR_LOGIN_TOKEN)

type CallbackState = 'verifying' | 'success' | 'error'

function CallbackHandler(): JSX.Element {
  const router = useRouter()
  const { verifyLogin, isAuthenticated } = useMentorAuth()
  const [state, setState] = useState<CallbackState>('verifying')
  const [errorMessage, setErrorMessage] = useState<string>('')
  const started = useRef(false)

  useEffect(() => {
    // If already authenticated, redirect to the dashboard
    if (isAuthenticated) {
      router.replace('/mentor')
      return
    }

    // Wait for router to be ready
    if (!router.isReady) return

    // Verify once: the verify route clears the pending token cookie, so a second
    // call would fail and overwrite the result.
    if (started.current) return
    started.current = true

    // The token is in an HttpOnly cookie set by getServerSideProps; the verify route reads it.
    const verify = async (): Promise<void> => {
      try {
        const result = await verifyLogin()
        if (result.success) {
          setState('success')
          analytics.event(analytics.events.MENTOR_AUTH_LOGIN_VERIFIED, {
            outcome: 'success',
          })
          // Redirect to dashboard after brief success message
          setTimeout(() => {
            router.replace('/mentor')
          }, 1500)
        } else {
          setState('error')
          analytics.event(analytics.events.MENTOR_AUTH_LOGIN_VERIFIED, {
            outcome: 'error',
            error_type: 'invalid_token',
          })
          setErrorMessage(result.message || 'Недействительная или просроченная ссылка')
        }
      } catch {
        setState('error')
        analytics.event(analytics.events.MENTOR_AUTH_LOGIN_VERIFIED, {
          outcome: 'error',
          error_type: 'verification_failed',
        })
        setErrorMessage('Произошла ошибка при проверке ссылки')
      }
    }

    verify()
  }, [router, router.isReady, verifyLogin, isAuthenticated])

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <Head>
        <title>Вход — getmentor.dev</title>
      </Head>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link href="/" className="flex justify-center mb-8">
          <Image src="/images/logo.png" width={180} height={36} alt="getmentor.dev" />
        </Link>

        <div className="bg-white py-8 px-4 shadow-lg sm:rounded-lg sm:px-10">
          <div className="text-center">
            {state === 'verifying' && (
              <>
                <FontAwesomeIcon
                  icon={faCircleNotch}
                  className="animate-spin text-indigo-500 text-4xl mb-4"
                />
                <h2 className="text-lg font-medium text-gray-900 mb-2">Проверяем ссылку...</h2>
                <p className="text-sm text-gray-600">Подождите, это займёт пару секунд</p>
              </>
            )}

            {state === 'success' && (
              <>
                <FontAwesomeIcon icon={faCheckCircle} className="text-green-500 text-4xl mb-4" />
                <h2 className="text-lg font-medium text-gray-900 mb-2">Вход выполнен!</h2>
                <p className="text-sm text-gray-600">Перенаправляем в личный кабинет...</p>
              </>
            )}

            {state === 'error' && (
              <>
                <FontAwesomeIcon icon={faTimesCircle} className="text-red-500 text-4xl mb-4" />
                <h2 className="text-lg font-medium text-gray-900 mb-2">Не удалось войти</h2>
                <p className="text-sm text-gray-600 mb-4">{errorMessage}</p>
                <Link
                  href="/mentor/login"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[#1A2238] hover:opacity-90 transition-opacity"
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

export default function MentorAuthCallbackPage(): JSX.Element {
  return (
    <MentorAuthProvider>
      <CallbackHandler />
    </MentorAuthProvider>
  )
}
