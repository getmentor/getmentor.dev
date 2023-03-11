const TEST = process.env.NEXT_PUBLIC_TESTING_MODE

if (TEST !== 'on') {
  let appInsights = require('applicationinsights')
  appInsights
    .setup(process.env.APPLICATIONINSIGHTS_CONNECTION_STRING)
    .setAutoCollectConsole(true)
    .setAutoCollectDependencies(true)
    .setAutoCollectExceptions(true)
    .setAutoCollectHeartbeat(true)
    .setAutoCollectPerformance(true, true)
    .setAutoCollectRequests(true)
    .setAutoDependencyCorrelation(true)
    .setDistributedTracingMode(appInsights.DistributedTracingModes.AI_AND_W3C)
    .setSendLiveMetrics(true)
    .setUseDiskRetryCaching(true)
  appInsights.defaultClient.setAutoPopulateAzureProperties(true)
  appInsights.start()
}
