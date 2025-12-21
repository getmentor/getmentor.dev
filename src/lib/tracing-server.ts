// tracing-server.ts - OpenTelemetry server-side (Next.js SSR/API routes) tracing

import { NodeSDK } from '@opentelemetry/sdk-node'
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http'
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node'
import { Resource } from '@opentelemetry/resources'
import {
  ATTR_SERVICE_NAME,
  ATTR_SERVICE_VERSION,
  ATTR_SERVICE_NAMESPACE,
  ATTR_SERVICE_INSTANCE_ID,
  ATTR_DEPLOYMENT_ENVIRONMENT,
} from '@opentelemetry/semantic-conventions/incubating'
import type { SpanExporter } from '@opentelemetry/sdk-trace-base'
import { v4 as uuidv4 } from 'uuid'

let sdk: NodeSDK | undefined

function registerServerTracing(): void {
  // Prevent double initialization
  if (sdk) {
    return
  }

  const alloyEndpoint = process.env.O11Y_EXPORTER_ENDPOINT || 'http://alloy:4318'
  const serviceName = process.env.O11Y_FE_SERVICE_NAME || 'getmentor-frontend'
  const serviceNamespace = process.env.O11Y_SERVICE_NAMESPACE || 'getmentor-dev'
  const serviceVersion = process.env.O11Y_FE_SERVICE_VERSION || '1.0.0'
  const environment = process.env.APP_ENV || process.env.NODE_ENV || 'production'

  // Ensure endpoint has protocol (JavaScript OTLP exporter needs full URL)
  // Backend uses Go client which expects host:port, frontend needs http://host:port
  const exporterUrl = alloyEndpoint.startsWith('http')
    ? `${alloyEndpoint}/v1/traces`
    : `http://${alloyEndpoint}/v1/traces`

  // Create OTLP exporter instance
  const traceExporter = new OTLPTraceExporter({
    url: exporterUrl,
    headers: {},
  }) as unknown as SpanExporter

  // Get or generate service instance ID
  const instanceId = process.env.SERVICE_INSTANCE_ID || uuidv4()

  // Create resource with service information
  const resource = new Resource({
    [ATTR_SERVICE_NAME]: serviceName,
    [ATTR_SERVICE_VERSION]: serviceVersion,
    [ATTR_SERVICE_NAMESPACE]: serviceNamespace,
    [ATTR_SERVICE_INSTANCE_ID]: instanceId,
    [ATTR_DEPLOYMENT_ENVIRONMENT]: environment,
  })

  // Initialize Node.js SDK with automatic instrumentation
  const sdkConfig = {
    traceExporter,
    resource,
    instrumentations: [
      getNodeAutoInstrumentations({
        '@opentelemetry/instrumentation-http': {
          requireParentforOutgoingSpans: false,
          requireParentforIncomingSpans: false,
          headersToSpanAttributes: {
            client: {
              requestHeaders: ['x-internal-mentors-api-auth-token'],
            },
          },
        },
        '@opentelemetry/instrumentation-express': {},
        '@opentelemetry/instrumentation-fs': { enabled: false },
        '@opentelemetry/instrumentation-dns': { enabled: false },
        '@opentelemetry/instrumentation-net': { enabled: false },
        '@opentelemetry/instrumentation-undici': {},
      }),
    ],
  } as unknown as ConstructorParameters<typeof NodeSDK>[0]

  sdk = new NodeSDK(sdkConfig)

  // Start the SDK
  sdk.start()

  // eslint-disable-next-line no-console
  console.log('[Tracing] Server-side OpenTelemetry initialized', {
    serviceName,
    serviceNamespace,
    serviceVersion,
    environment,
    exporterUrl,
  })

  // Note: No graceful shutdown handler - SDK will export periodically
  // Accepting potential data loss on termination for code simplicity
}

export { registerServerTracing }
