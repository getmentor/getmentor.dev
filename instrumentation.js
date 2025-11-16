/**
 * Next.js Instrumentation Hook
 * This file is loaded before the Next.js server starts
 * Use it to initialize observability and monitoring
 */

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // Initialize OpenTelemetry server-side tracing FIRST
    const { registerServerTracing } = await import('./src/lib/tracing-server')
    registerServerTracing()

    // Initialize metrics and logger
    // These will be available throughout the application
    const { default: register } = await import('./src/lib/metrics')
    const { default: logger } = await import('./src/lib/logger')

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
  }
}
