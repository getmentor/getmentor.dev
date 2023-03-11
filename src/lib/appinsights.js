import { ApplicationInsights } from '@microsoft/applicationinsights-web'
import { ReactPlugin } from '@microsoft/applicationinsights-react-js'

const defaultBrowserHistory = {
  url: '/',
  location: { pathname: '' },
  listen: () => {},
}

let browserHistory = defaultBrowserHistory
if (typeof window !== 'undefined') {
  browserHistory = { ...browserHistory, ...window.history }
  browserHistory.location.pathname = browserHistory?.state?.url
}

const TEST = process.env.NEXT_PUBLIC_TESTING_MODE

if (TEST !== 'on') {
  var reactPlugin = new ReactPlugin()
  var appInsights = new ApplicationInsights({
    config: {
      connectionString: process.env.NEXT_PUBLIC_APPLICATIONINSIGHTS_CONNECTION_STRING,
      extensions: [reactPlugin],
      extensionConfig: {
        [reactPlugin.identifier]: { history: browserHistory },
      },
    },
  })

  if (typeof window !== 'undefined') {
    appInsights.loadAppInsights()
  }
}

export { appInsights, reactPlugin }
