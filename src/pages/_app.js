import '../styles/globals.css'
import '@fortawesome/fontawesome-svg-core/styles.css'
import { useEffect } from 'react'
import TagManager from 'react-gtm-module'
import { AppInsightsContext } from '@microsoft/applicationinsights-react-js'
import { reactPlugin } from '../lib/appinsights'

function MyApp({ Component, pageProps }) {
  useEffect(() => {
    TagManager.initialize({ gtmId: 'GTM-NBGRPCZ' })
  }, [])

  const TEST = process.env.NEXT_PUBLIC_TESTING_MODE

  if (TEST === 'on') {
    return <Component {...pageProps} />
  }
  return (
    <AppInsightsContext.Provider value={reactPlugin}>
      <Component {...pageProps} />
    </AppInsightsContext.Provider>
  )
}

export default MyApp
