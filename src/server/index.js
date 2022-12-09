require('dotenv').config()

const appInsights = require('applicationinsights')
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

const express = require('express')
const logger = require('morgan')
const bodyParser = require('body-parser')
const next = require('next')
const apiRouter = require('./api-router')

const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

const PORT = process.env.PORT || 3000

app
  .prepare()
  .then(() => {
    var server = express()

    server.use(bodyParser.json())
    server.use(bodyParser.urlencoded({ extended: true }))
    server.use(logger(process.env.NODE_ENV !== 'production' ? 'dev' : 'tiny'))

    server.use('/api', apiRouter)

    server.get('*', (req, res) => {
      return handle(req, res)
    })
    server.post('*', (req, res) => {
      return handle(req, res)
    })

    server.listen(PORT, (err) => {
      if (err) throw err
      console.log('> Ready on http://localhost:' + PORT)
    })
  })
  .catch((ex) => {
    console.error(ex.stack)
    process.exit(1)
  })
