// tracing-server.js - OpenTelemetry server-side (Next.js SSR/API routes) tracing

const { NodeSDK } = require('@opentelemetry/sdk-node')
const { OTLPTraceExporter } = require('@opentelemetry/exporter-trace-otlp-http')
const { Resource } = require('@opentelemetry/resources')
const {
  SEMRESATTRS_SERVICE_NAME,
  SEMRESATTRS_SERVICE_VERSION,
  SEMRESATTRS_DEPLOYMENT_ENVIRONMENT,
} = require('@opentelemetry/semantic-conventions')
const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node')

let sdk

function registerServerTracing() {
  // Prevent double initialization
  if (sdk) {
    // eslint-disable-next-line no-console
    console.log('[Tracing] Server tracing already initialized')
    return
  }

  const alloyEndpoint = process.env.ALLOY_ENDPOINT || 'http://alloy:4318'
  const serviceName = process.env.SERVICE_NAME || 'getmentor-frontend'
  const serviceVersion = process.env.SERVICE_VERSION || '1.0.0'
  const environment = process.env.APP_ENV || process.env.NODE_ENV || 'production'

  // eslint-disable-next-line no-console
  console.log('[Tracing] Initializing server-side OpenTelemetry tracing', {
    serviceName,
    serviceVersion,
    environment,
    endpoint: `${alloyEndpoint}/v1/traces`,
  })

  // Create OTLP HTTP exporter pointing to Grafana Alloy
  const traceExporter = new OTLPTraceExporter({
    url: `${alloyEndpoint}/v1/traces`,
    headers: {},
  })

  // Create resource with service information
  const resource = new Resource({
    [SEMRESATTRS_SERVICE_NAME]: serviceName,
    [SEMRESATTRS_SERVICE_VERSION]: serviceVersion,
    [SEMRESATTRS_DEPLOYMENT_ENVIRONMENT]: environment,
  })

  // Initialize Node.js SDK with automatic instrumentation
  sdk = new NodeSDK({
    resource,
    traceExporter,
    instrumentations: [
      getNodeAutoInstrumentations({
        // Automatically instrument:
        '@opentelemetry/instrumentation-http': {}, // HTTP/HTTPS requests
        '@opentelemetry/instrumentation-express': {}, // Express (used by Next.js)
        '@opentelemetry/instrumentation-fs': {}, // File system operations
        '@opentelemetry/instrumentation-dns': {}, // DNS lookups
        '@opentelemetry/instrumentation-net': {}, // Network operations
      }),
    ],
  })

  // Start the SDK
  sdk.start()

  // eslint-disable-next-line no-console
  console.log('[Tracing] Server-side OpenTelemetry initialized successfully')

  // Graceful shutdown on process termination
  process.on('SIGTERM', () => {
    sdk
      ?.shutdown()
      .then(() => console.log('[Tracing] Server tracing shut down successfully')) // eslint-disable-line no-console
      .catch((error) => console.error('[Tracing] Error shutting down server tracing', error)) // eslint-disable-line no-console
      .finally(() => process.exit(0))
  })
}

module.exports = { registerServerTracing }
