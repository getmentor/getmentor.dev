// tracing-server.js - OpenTelemetry server-side (Next.js SSR/API routes) tracing

const { NodeSDK } = require('@opentelemetry/sdk-node')
const { OTLPTraceExporter } = require('@opentelemetry/exporter-trace-otlp-http')
const { Resource } = require('@opentelemetry/resources')
const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node')

let sdk

function registerServerTracing() {
  // Prevent double initialization
  if (sdk) {
    return
  }

  const alloyEndpoint = process.env.O11Y_EXPORTER_ENDPOINT || 'http://alloy:4318'
  const serviceName = process.env.O11Y_SERVICE_NAME || 'getmentor-frontend'
  const serviceNamespace = process.env.O11Y_SERVICE_NAMESPACE || 'getmentor-dev'
  const serviceVersion = process.env.O11Y_SERVICE_VERSION || '1.0.0'
  const environment = process.env.APP_ENV || process.env.NODE_ENV || 'production'

  // Create OTLP HTTP exporter pointing to Grafana Alloy
  const traceExporter = new OTLPTraceExporter({
    url: `${alloyEndpoint}/v1/traces`,
    headers: {},
  })

  // Create resource with service information
  const resource = new Resource({
    'service.name': serviceName,
    'service.version': serviceVersion,
    'service.namespace': serviceNamespace,
    'deployment.environment': environment,
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

  // Graceful shutdown on process termination
  process.on('SIGTERM', () => {
    sdk
      ?.shutdown()
      .catch((error) => console.error('[Tracing] Error shutting down server tracing', error)) // eslint-disable-line no-console
      .finally(() => process.exit(0))
  })
}

module.exports = { registerServerTracing }
