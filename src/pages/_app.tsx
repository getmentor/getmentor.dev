import '../styles/globals.css'
import '@fortawesome/fontawesome-svg-core/styles.css'
import { useEffect } from 'react'
import TagManager from 'react-gtm-module'
import { initializeFaro } from '@/lib/faro'
import { initializePostHog } from '@/lib/posthog'
import { ErrorBoundary } from '@/components'
import type { AppProps } from 'next/app'

// Initialize observability on client-side only (outside component to run once)
if (typeof window !== 'undefined') {
  initializeFaro()
  initializePostHog()
}

function MyApp({ Component, pageProps }: AppProps): JSX.Element {
  useEffect(() => {
    // Initialize Google Tag Manager
    TagManager.initialize({ gtmId: 'GTM-NBGRPCZ' })
  }, [])

  return (
    <ErrorBoundary>
      <Component {...pageProps} />
    </ErrorBoundary>
  )
}

export default MyApp
