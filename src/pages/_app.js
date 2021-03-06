import '../styles/globals.css'
import '@fortawesome/fontawesome-svg-core/styles.css'
import { useEffect } from 'react'
import TagManager from 'react-gtm-module'

function MyApp({ Component, pageProps }) {
  useEffect(() => {
    TagManager.initialize({ gtmId: 'GTM-NBGRPCZ' })
  }, [])
  return <Component {...pageProps} />
}

export default MyApp

export function reportWebVitals(metric) {
  const body = JSON.stringify(metric)
  const url = '/__appsignal-web-vitals'

  // Use `navigator.sendBeacon()` if available, falling back to `fetch()`.
  ;(navigator.sendBeacon && navigator.sendBeacon(url, body)) ||
    fetch(url, { body, method: 'POST', keepalive: true })
}
