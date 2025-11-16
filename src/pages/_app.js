import '../styles/globals.css'
import '@fortawesome/fontawesome-svg-core/styles.css'
import { useEffect } from 'react'
import TagManager from 'react-gtm-module'
import { registerClientTracing } from '../lib/tracing-client'

function MyApp({ Component, pageProps }) {
  useEffect(() => {
    // Initialize Google Tag Manager
    TagManager.initialize({ gtmId: 'GTM-NBGRPCZ' })

    // Initialize OpenTelemetry browser tracing
    registerClientTracing()
  }, [])

  return <Component {...pageProps} />
}

export default MyApp
