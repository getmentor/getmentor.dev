/**
 * Simplified metrics for frontend-only Next.js application
 * Tracks HTTP requests, SSR performance, and frontend-specific business metrics
 * Backend metrics (Airtable, Cache) now handled by Go API
 */

import promClient from 'prom-client'

// Use the default global registry to avoid issues with Next.js module loading
// This ensures all metrics across all API routes use the same registry instance
const register = promClient.register

// General metrics prefix
const prefix = 'getmentor_frontend_'

// Only initialize default metrics if not already done
const hasDefaultMetrics =
  register.getSingleMetric('gm_nextjs_process_cpu_user_seconds_total') !== undefined

if (!hasDefaultMetrics) {
  // Add default metrics (CPU, memory, event loop lag, etc.)
  promClient.collectDefaultMetrics({
    register,
    prefix: 'gm_nextjs_',
    gcDurationBuckets: [0.001, 0.01, 0.1, 1, 2, 5],
  })
}

// Helper function to get or create metric
// This prevents "metric already registered" errors in Next.js
function getOrCreateMetric(metricType, config) {
  const existing = register.getSingleMetric(config.name)
  if (existing) {
    return existing
  }
  return new metricType(config)
}

// HTTP request duration histogram
export const httpRequestDuration = getOrCreateMetric(promClient.Histogram, {
  name: prefix + 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10],
  registers: [register],
})

// HTTP request counter
export const httpRequestTotal = getOrCreateMetric(promClient.Counter, {
  name: prefix + 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register],
})

// Active requests gauge
export const activeRequests = getOrCreateMetric(promClient.Gauge, {
  name: prefix + 'http_active_requests',
  help: 'Number of active HTTP requests',
  labelNames: ['method', 'route'],
  registers: [register],
})

// SSR metrics
export const serverSideRenderDuration = getOrCreateMetric(promClient.Histogram, {
  name: prefix + 'ssr_duration_seconds',
  help: 'Duration of server-side rendering in seconds',
  labelNames: ['page', 'status'],
  buckets: [0.1, 0.3, 0.5, 1, 2, 5, 10],
  registers: [register],
})

export const pageViews = getOrCreateMetric(promClient.Counter, {
  name: prefix + 'page_views_total',
  help: 'Total number of page views (SSR)',
  labelNames: ['page'],
  registers: [register],
})

// Frontend business metrics
export const mentorProfileViews = getOrCreateMetric(promClient.Counter, {
  name: prefix + 'mentor_profile_views_total',
  help: 'Total number of mentor profile views',
  labelNames: ['mentor_slug'],
  registers: [register],
})

export const mentorSearches = getOrCreateMetric(promClient.Counter, {
  name: prefix + 'mentor_searches_total',
  help: 'Total number of mentor searches performed (client-side)',
  labelNames: ['has_filters', 'search_type'],
  registers: [register],
})

// Export the register for Prometheus to scrape
export default register
