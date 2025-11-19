import { registerServerTracing } from './lib/tracing-server'
import { register as registerMetrics } from './lib/metrics'
import logger from './lib/logger'

// instrumentation.js - Next.js server-side OpenTelemetry instrumentation
// This file is automatically loaded by Next.js 13+ when experimental.instrumentationHook is enabled

export function register() {
  // Check if we're in a Node.js environment (not edge runtime)
  // NEXT_RUNTIME is not available during register() hook, so we check other indicators
  if (typeof process !== 'undefined' && process.versions?.node) {
    // eslint-disable-next-line no-console
    console.log('[Instrumentation] Initializing observability stack...')

    try {
      // Initialize OpenTelemetry server-side tracing FIRST
      // This must happen before any HTTP requests are made
      registerServerTracing()

      // Initialize metrics and logger
      // These will be available throughout the application
      logger.info('Observability instrumentation initialized', {
        runtime: 'nodejs',
        env: process.env.NODE_ENV,
      })

      // Log on process exit
      process.on('SIGTERM', () => {
        logger.info('Received SIGTERM, shutting down gracefully')
      })

      process.on('SIGINT', () => {
        logger.info('Received SIGINT, shutting down gracefully')
      })
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('[Instrumentation] Failed to initialize observability:', error)
    }
  }
}
