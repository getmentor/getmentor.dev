#!/usr/bin/env node
// start-server.js - Wrapper to initialize observability before Next.js server starts
// This is a workaround for instrumentation hook not working in standalone builds

// eslint-disable-next-line no-console
console.log('[Startup] Initializing observability before Next.js server...')

// Initialize OpenTelemetry tracing FIRST (must be before any HTTP requests)
try {
  const { registerServerTracing } = require('./src/lib/tracing-server')
  registerServerTracing()
  // eslint-disable-next-line no-console
  console.log('[Startup] Server-side tracing initialized')
} catch (error) {
  // eslint-disable-next-line no-console
  console.error('[Startup] Failed to initialize tracing:', error)
}

// Initialize metrics and logger
try {
  const register = require('./src/lib/metrics')
  const logger = require('./src/lib/logger')
  logger.default.info('Observability stack initialized via startup wrapper', {
    env: process.env.NODE_ENV,
  })
} catch (error) {
  // eslint-disable-next-line no-console
  console.error('[Startup] Failed to initialize metrics/logger:', error)
}

// Now start the Next.js server
// eslint-disable-next-line no-console
console.log('[Startup] Starting Next.js server...')
require('./server.js')
