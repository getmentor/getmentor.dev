/**
 * Barrel export for lib modules
 */

// Utilities
export { default as pluralize } from './pluralize'
export { htmlContent } from './html-content'
export { default as analytics } from './analytics'
export { default as cloudinary, type CloudinaryParams } from './cloudinary'

// Image loading
export { imageLoader } from './azure-image-loader'

// API client
export { getGoApiClient, HttpError, default as GoApiClient } from './go-api-client'

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
// Tracing
export { registerServerTracing } from './tracing-server'

// Grafana Faro (client-side observability)
export { initializeFaro, getFaro, pushEvent, pushError, setUser } from './faro'

// Unified error reporting (Faro + PostHog)
export { reportError } from './report-error'
