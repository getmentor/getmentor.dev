// tracing-client.ts - OpenTelemetry client-side (browser) tracing

import { WebTracerProvider, BatchSpanProcessor } from '@opentelemetry/sdk-trace-web'
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http'
import { FetchInstrumentation } from '@opentelemetry/instrumentation-fetch'
import { registerInstrumentations } from '@opentelemetry/instrumentation'
import { W3CTraceContextPropagator } from '@opentelemetry/core'
import { trace, Tracer } from '@opentelemetry/api'
import { Resource } from '@opentelemetry/resources'
import {
  ATTR_SERVICE_NAME,
  ATTR_SERVICE_VERSION,
  ATTR_SERVICE_NAMESPACE,
  ATTR_SERVICE_INSTANCE_ID,
  ATTR_DEPLOYMENT_ENVIRONMENT,
} from '@opentelemetry/semantic-conventions/incubating'
import { v4 as uuidv4 } from 'uuid'

let isInitialized = false

export function registerClientTracing(): void {
  // Prevent double initialization
  if (isInitialized || typeof window === 'undefined') {
    return
  }

  try {
    const alloyEndpoint = process.env.NEXT_PUBLIC_O11Y_EXPORTER_ENDPOINT || 'http://localhost:4318'
    const serviceName = process.env.NEXT_PUBLIC_O11Y_FE_SERVICE_NAME || 'getmentor-frontend'
    const serviceNamespace = process.env.NEXT_PUBLIC_O11Y_SERVICE_NAMESPACE || 'getmentor-dev'
    const serviceVersion = process.env.NEXT_PUBLIC_O11Y_FE_SERVICE_VERSION || '1.0.0'
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

    // Get or generate service instance ID
    const instanceId = process.env.SERVICE_INSTANCE_ID || uuidv4()

    // Create resource with service information (matches backend namespace)
    const resource = new Resource({
      [ATTR_SERVICE_NAME]: serviceName,
      [ATTR_SERVICE_VERSION]: serviceVersion,
      [ATTR_SERVICE_NAMESPACE]: serviceNamespace,
      [ATTR_SERVICE_INSTANCE_ID]: instanceId,
      [ATTR_DEPLOYMENT_ENVIRONMENT]: environment,
    })

    // Create tracer provider with resource
    const provider = new WebTracerProvider({ resource })

    // Verify provider was created successfully
    if (!provider || typeof provider.addSpanProcessor !== 'function') {
      throw new Error('WebTracerProvider not initialized correctly')
    }

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
  } catch (error) {
    console.error('[Tracing] Failed to initialize client-side tracing:', error)
    // Don't throw - allow app to continue without tracing
  }
}

// Export tracer for manual instrumentation
export function getTracer(): Tracer {
  return trace.getTracer('getmentor-frontend-manual')
}
