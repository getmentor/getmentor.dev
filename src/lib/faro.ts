// faro.ts - Grafana Faro client-side observability

import {
  initializeFaro as initFaro,
  getWebInstrumentations,
  type Faro,
  type Instrumentation,
} from '@grafana/faro-web-sdk'
import { TracingInstrumentation } from '@grafana/faro-web-tracing'

let faroInstance: Faro | null = null

export function initializeFaro(): Faro | null {
  // Prevent double initialization and server-side execution
  if (faroInstance || typeof window === 'undefined') {
    return faroInstance
  }

  const collectorUrl = process.env.NEXT_PUBLIC_FARO_COLLECTOR_URL

  // Skip initialization if no collector URL is configured
  if (!collectorUrl) {
    // eslint-disable-next-line no-console
    console.log('[Faro] Skipping initialization - NEXT_PUBLIC_FARO_COLLECTOR_URL not configured')
    return null
  }

  const appName = process.env.NEXT_PUBLIC_FARO_APP_NAME || 'getmentor-frontend'

  const appNamespace = process.env.NEXT_PUBLIC_O11Y_SERVICE_NAMESPACE || 'getmentor-dev'

  const appVersion = process.env.NEXT_PUBLIC_O11Y_SERVICE_VERSION || '1.0.0'

  const appEnvironment = process.env.NEXT_PUBLIC_APP_ENV || process.env.NODE_ENV || 'production'

  try {
    // eslint-disable-next-line no-console
    console.log('[Faro] Initializing Grafana Faro', {
      appName,
      appVersion,
      appEnvironment,
      collectorUrl,
    })

    // Use Next.js rewrite to proxy requests and bypass CORS
    // Browser sends to /faro-collect -> Next.js rewrites to Grafana Cloud
    const proxyUrl = '/faro-collect'

    faroInstance = initFaro({
      url: proxyUrl,
      app: {
        name: appName,
        namespace: appNamespace,
        version: appVersion,
        environment: appEnvironment,
      },
      sessionTracking: {
        samplingRate: Number.parseFloat(process.env.NEXT_PUBLIC_FARO_SAMPLE_RATE || '1'),
        persistent: false,
      },
      instrumentations: [
        // Default web instrumentations: errors, console, web vitals, session
        ...getWebInstrumentations(),
        // OpenTelemetry tracing integration
        new TracingInstrumentation({
          instrumentationOptions: {
            propagateTraceHeaderCorsUrls: [
              /localhost:8081/,
              /backend:8081/,
              new RegExp(process.env.NEXT_PUBLIC_GO_API_URL || ''),
            ],
          },
        }) as Instrumentation,
      ],
    })

    // eslint-disable-next-line no-console
    console.log('[Faro] Grafana Faro initialized successfully')

    return faroInstance
  } catch (error) {
    console.error('[Faro] Failed to initialize Grafana Faro:', error)
    return null
  }
}

export function getFaro(): Faro | null {
  return faroInstance
}

// Helper to push custom events
export function pushEvent(name: string, attributes?: Record<string, string>): void {
  if (faroInstance) {
    faroInstance.api.pushEvent(name, attributes)
  }
}

// Helper to push errors
export function pushError(error: Error, context?: Record<string, string>): void {
  if (faroInstance) {
    faroInstance.api.pushError(error, { context })
  }
}

// Helper to set user context
export function setUser(userId: string, attributes?: Record<string, string>): void {
  if (faroInstance) {
    faroInstance.api.setUser({
      id: userId,
      attributes,
    })
  }
}
