import '../styles/globals.css'
import '@fortawesome/fontawesome-svg-core/styles.css'
import { useEffect } from 'react'
import TagManager from 'react-gtm-module'
import type { AppProps } from 'next/app'

function MyApp({ Component, pageProps }: AppProps): JSX.Element {
  useEffect(() => {
    // Initialize Google Tag Manager
    TagManager.initialize({ gtmId: 'GTM-NBGRPCZ' })
  }, [])

  return <Component {...pageProps} />
}

export default MyApp
