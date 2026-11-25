/**
 * Mentee magic-link callback: exchanges the one-time token for a session.
 *
 * The emailed link carries ?token=. getServerSideProps moves it into a short-lived
 * HttpOnly cookie (sent only to the verify route) and redirects to this page without
 * the query string, so no browser script, including telemetry that records the URL on
 * load, ever sees the token. The token is consumed only by the POST below, never by
 * the GET, so email link scanners can't use it up.
 */

import { useEffect, useRef, useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleNotch, faTimesCircle } from '@fortawesome/free-solid-svg-icons'
import { MenteeAuthProvider, useMenteeAuth } from '@/components/mentee'
import analytics from '@/lib/analytics'
import { loginCallbackServerSideProps, MENTEE_LOGIN_TOKEN } from '@/lib/login-token-handoff'

export const getServerSideProps = loginCallbackServerSideProps(MENTEE_LOGIN_TOKEN)

function CallbackHandler(): JSX.Element {
  const router = useRouter()
  const { verifyLogin } = useMenteeAuth()
  const [failed, setFailed] = useState(false)
  const started = useRef(false)

  useEffect(() => {
    if (!router.isReady || started.current) return
    started.current = true

    // The token is in an HttpOnly cookie set by getServerSideProps; the verify route reads it.
    verifyLogin().then((ok) => {
      analytics.event(analytics.events.MENTEE_AUTH_LOGIN_VERIFIED, {
        outcome: ok ? 'success' : 'invalid_token',
      })
      if (ok) {
        router.replace('/mentee')
      } else {
        setFailed(true)
      }
    })
  }, [router, verifyLogin])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <Head>
        <title>Вход — getmentor.dev</title>
        <meta name="robots" content="noindex,nofollow" />
        <meta name="referrer" content="no-referrer" />
      </Head>
      <div className="bg-white shadow-lg rounded-lg p-8 max-w-md w-full text-center">
        {failed ? (
          <>
            <FontAwesomeIcon icon={faTimesCircle} className="text-red-500 text-4xl mb-4" />
            <h2 className="text-lg font-medium text-gray-900 mb-2">Ссылка не работает</h2>
            <p className="text-sm text-gray-600 mb-6">
              Ссылка для входа недействительна, уже использована или просрочена.
            </p>
            <Link
              href="/mentee/login"
              className="inline-block px-5 py-2 bg-[#1A2238] text-white text-sm font-medium rounded-md hover:opacity-90"
            >
              Получить новую ссылку
            </Link>
          </>
        ) : (
          <>
            <FontAwesomeIcon
              icon={faCircleNotch}
              className="animate-spin text-indigo-500 text-3xl mb-4"
            />
            <p className="text-sm text-gray-600">Проверяем ссылку...</p>
          </>
        )}
      </div>
    </div>
  )
}

export default function MenteeAuthCallbackPage(): JSX.Element {
  return (
    <MenteeAuthProvider>
      <CallbackHandler />
    </MenteeAuthProvider>
  )
}
