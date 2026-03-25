import { captureException } from '@/lib/posthog'
import { getPostHogServerClient } from '@/lib/posthog-server'
import type { NextPageContext } from 'next'

interface ErrorPageProps {
  statusCode: number
}

function ErrorPage({ statusCode }: ErrorPageProps): JSX.Element {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">{statusCode}</h1>
        <p className="text-gray-600">
          {statusCode === 404
            ? 'Страница не найдена.'
            : 'Произошла ошибка. Мы уже работаем над исправлением.'}
        </p>
      </div>
    </div>
  )
}

ErrorPage.getInitialProps = ({ res, err }: NextPageContext): ErrorPageProps => {
  const statusCode = res?.statusCode ?? err?.statusCode ?? 500
  if (err) {
    if (typeof window === 'undefined') {
      const serverClient = getPostHogServerClient()
      serverClient?.captureException(err)
    } else {
      captureException(err)
    }
  }
  return { statusCode }
}

export default ErrorPage
