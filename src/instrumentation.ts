// instrumentation.js - Next.js server-side OpenTelemetry instrumentation

import { registerServerTracing } from './lib/tracing-server'
import logger, { getTraceContext } from './lib/logger'

export async function register(): Promise<void> {
  // eslint-disable-next-line no-console
  console.log('[Instrumentation] Initializing observability stack...')

  try {
    // Initialize OpenTelemetry server-side tracing
    registerServerTracing()

    // Initialize logger
    logger.info('Observability instrumentation initialized', {
      runtime: 'nodejs',
      env: process.env.NODE_ENV,
      ...getTraceContext(),
    })
  } catch (error: unknown) {
    console.error('[Instrumentation] Failed to initialize observability:', error)
  }
}
