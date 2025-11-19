// tracing-server.js - OpenTelemetry server-side (Next.js SSR/API routes) tracing

import { NodeSDK } from '@opentelemetry/sdk-node'
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http'
import { Resource } from '@opentelemetry/resources'
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node'

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
        '@opentelemetry/instrumentation-http': {
          // Enable trace context propagation
          requireParentforOutgoingSpans: false,
          requireParentforIncomingSpans: false,
          headersToSpanAttributes: {
            client: {
              requestHeaders: ['x-internal-mentors-api-auth-token'],
            },
          },
        },
        '@opentelemetry/instrumentation-express': {}, // Express (used by Next.js)
        '@opentelemetry/instrumentation-fs': { enabled: false }, // Disable noisy FS operations
        '@opentelemetry/instrumentation-dns': { enabled: false }, // Disable noisy DNS lookups
        '@opentelemetry/instrumentation-net': { enabled: false }, // Disable noisy network operations
        // Undici is used by Node.js fetch() - enable for trace propagation
        '@opentelemetry/instrumentation-undici': {
          requireParentforOutgoingSpans: false,
          requireParentforIncomingSpans: false,
        },
      }),
    ],
  })

  // Start the SDK
  sdk.start()

  // eslint-disable-next-line no-console
  console.log('[Tracing] Server-side OpenTelemetry initialized', {
    serviceName,
    serviceNamespace,
    serviceVersion,
    environment,
    alloyEndpoint,
  })

  // Graceful shutdown on process termination
  process.on('SIGTERM', () => {
    sdk
      ?.shutdown()
      .catch((error) => console.error('[Tracing] Error shutting down server tracing', error)) // eslint-disable-line no-console
      .finally(() => process.exit(0))
  })
}

export { registerServerTracing }
