// tracing-client.js - OpenTelemetry client-side (browser) tracing

import { WebTracerProvider, BatchSpanProcessor } from '@opentelemetry/sdk-trace-web'
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http'
import { FetchInstrumentation } from '@opentelemetry/instrumentation-fetch'
import { registerInstrumentations } from '@opentelemetry/instrumentation'
import { W3CTraceContextPropagator } from '@opentelemetry/core'
import { trace } from '@opentelemetry/api'

let isInitialized = false

export function registerClientTracing() {
  // Prevent double initialization
  if (isInitialized || typeof window === 'undefined') {
    return
  }

  const alloyEndpoint = process.env.NEXT_PUBLIC_ALLOY_ENDPOINT || 'http://localhost:4318'
  const serviceName = process.env.NEXT_PUBLIC_SERVICE_NAME || 'getmentor-frontend'
  const serviceVersion = process.env.NEXT_PUBLIC_SERVICE_VERSION || '1.0.0'
  const environment = process.env.NEXT_PUBLIC_APP_ENV || process.env.NODE_ENV || 'production'

  // eslint-disable-next-line no-console
  console.log('[Tracing] Initializing client-side OpenTelemetry tracing', {
    serviceName,
    serviceVersion,
    environment,
    endpoint: `${alloyEndpoint}/v1/traces`,
  })

  // Create OTLP HTTP exporter pointing to Grafana Alloy
  const exporter = new OTLPTraceExporter({
    url: `${alloyEndpoint}/v1/traces`,
    headers: {},
  })

  // Create tracer provider with resource attributes
  const provider = new WebTracerProvider({
    resource: {
      attributes: {
        'service.name': serviceName,
        'service.version': serviceVersion,
        'deployment.environment': environment,
      },
    },
  })

  // Add batch span processor
  provider.addSpanProcessor(new BatchSpanProcessor(exporter))

  // Register the provider
  provider.register({
    propagator: new W3CTraceContextPropagator(),
  })

  // Auto-instrument fetch() calls
  registerInstrumentations({
    instrumentations: [
      new FetchInstrumentation({
        // Propagate trace context to backend
        propagateTraceHeaderCorsUrls: [
          /localhost:8081/, // Local development
          /backend:8081/, // Docker Compose
          new RegExp(process.env.NEXT_PUBLIC_GO_API_URL || ''), // Production
        ],
        clearTimingResources: true,
      }),
    ],
  })

  isInitialized = true
  // eslint-disable-next-line no-console
  console.log('[Tracing] Client-side OpenTelemetry initialized successfully')
}

// Export tracer for manual instrumentation
export function getTracer() {
  return trace.getTracer('getmentor-frontend-manual')
}
