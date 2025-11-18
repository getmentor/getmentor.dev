import '../styles/globals.css'
import '@fortawesome/fontawesome-svg-core/styles.css'
import { useEffect } from 'react'
import TagManager from 'react-gtm-module'
// import { registerClientTracing } from '../lib/tracing-client'

function MyApp({ Component, pageProps }) {
  useEffect(() => {
    // Initialize Google Tag Manager
    TagManager.initialize({ gtmId: 'GTM-NBGRPCZ' })

    // Browser-side tracing disabled - using server-side only
    // Uncomment below to enable browser-side tracing in the future:
    // registerClientTracing()
  }, [])

  return <Component {...pageProps} />
}

export default MyApp
