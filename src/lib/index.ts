/**
 * Barrel export for lib modules
 */

// Utilities
export { default as pluralize } from './pluralize'
export { CALENDAR_URL } from './entities'
export { htmlContent } from './html-content'
export { default as analytics } from './analytics'
export { default as cloudinary, type CloudinaryParams } from './cloudinary'

// Image loading
export { imageLoader } from './azure-image-loader'

// API client
export { getGoApiClient, HttpError, default as GoApiClient } from './go-api-client'

// Middleware
export { default as initMiddleware } from './init-middleware'

// Observability
export {
  default as logger,
  createContextLogger,
  logHttpRequest,
  logError,
  type ContextLogger,
} from './logger'
export {
  default as metricsRegister,
  httpRequestDuration,
  httpRequestTotal,
  activeRequests,
  serverSideRenderDuration,
  pageViews,
  mentorProfileViews,
  mentorSearches,
} from './metrics'
export { withObservability, measureAsync, measureSync } from './with-observability'
export { withSSRObservability, withStaticPropsObservability } from './with-ssr-observability'
export { default as HttpLogTransport } from './http-log-transport'

// Tracing
export { registerClientTracing, getTracer } from './tracing-client'
export { registerServerTracing } from './tracing-server'

// Grafana Faro (client-side observability)
export { initializeFaro, getFaro, pushEvent, pushError, setUser } from './faro'
