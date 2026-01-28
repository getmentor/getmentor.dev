/**
 * Simplified metrics for frontend-only Next.js application
 * Tracks HTTP requests, SSR performance, and frontend-specific business metrics
 * Backend metrics (Airtable, Cache) now handled by Go API
 */

import promClient, { Counter, Gauge, Histogram, Registry } from 'prom-client'

// Use the default global registry to avoid issues with Next.js module loading
// This ensures all metrics across all API routes use the same registry instance
const register: Registry = promClient.register

// Set default labels for ALL metrics in this registry
// These constant labels are added to every metric automatically
// Aligns with Grafana Cloud expectations and enables proper service filtering in SLOs
register.setDefaultLabels({
  service_name: process.env.O11Y_FE_SERVICE_NAME || 'getmentor-frontend',
})

// Only initialize default metrics if not already done
// Use standard metric names without prefix - service differentiation via labels
const hasDefaultMetrics = register.getSingleMetric('process_cpu_user_seconds_total') !== undefined

if (!hasDefaultMetrics) {
  // Add default metrics (CPU, memory, event loop lag, etc.)
  // No prefix - uses standard Node.js/process metric names
  // Additional label 'runtime' helps distinguish from Go backend
  promClient.collectDefaultMetrics({
    register,
    labels: { runtime: 'nodejs' },
    gcDurationBuckets: [0.001, 0.01, 0.1, 1, 2, 5],
  })
}

interface MetricConfig {
  name: string
  help: string
  labelNames?: string[]
  buckets?: number[]
  registers?: Registry[]
}

// Helper function to get or create metric
// This prevents "metric already registered" errors in Next.js
function getOrCreateHistogram(config: MetricConfig): Histogram<string> {
  const existing = register.getSingleMetric(config.name)
  if (existing) {
    return existing as Histogram<string>
  }
  return new promClient.Histogram({
    name: config.name,
    help: config.help,
    labelNames: config.labelNames || [],
    buckets: config.buckets,
    registers: config.registers,
  })
}

function getOrCreateCounter(config: MetricConfig): Counter<string> {
  const existing = register.getSingleMetric(config.name)
  if (existing) {
    return existing as Counter<string>
  }
  return new promClient.Counter({
    name: config.name,
    help: config.help,
    labelNames: config.labelNames || [],
    registers: config.registers,
  })
}

function getOrCreateGauge(config: MetricConfig): Gauge<string> {
  const existing = register.getSingleMetric(config.name)
  if (existing) {
    return existing as Gauge<string>
  }
  return new promClient.Gauge({
    name: config.name,
    help: config.help,
    labelNames: config.labelNames || [],
    registers: config.registers,
  })
}

// HTTP request duration histogram
export const httpRequestDuration: Histogram<string> = getOrCreateHistogram({
  name: 'http_server_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['http_request_method', 'http_route', 'http_response_status_code'],
  buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10],
  registers: [register],
})

// HTTP request counter
export const httpRequestTotal: Counter<string> = getOrCreateCounter({
  name: 'http_server_request_total',
  help: 'Total number of HTTP requests',
  labelNames: ['http_request_method', 'http_route', 'http_response_status_code'],
  registers: [register],
})

// Active requests gauge
export const activeRequests: Gauge<string> = getOrCreateGauge({
  name: 'http_server_active_requests',
  help: 'Number of active HTTP requests',
  labelNames: ['http_request_method', 'http_route'],
  registers: [register],
})

// SSR metrics
export const serverSideRenderDuration: Histogram<string> = getOrCreateHistogram({
  name: 'nextjs_ssr_duration_seconds',
  help: 'Duration of server-side rendering in seconds',
  labelNames: ['page', 'status'],
  buckets: [0.1, 0.3, 0.5, 1, 2, 5, 10],
  registers: [register],
})

export const pageViews: Counter<string> = getOrCreateCounter({
  name: 'nextjs_page_views_total',
  help: 'Total number of page views (SSR)',
  labelNames: ['page'],
  registers: [register],
})

// Frontend business metrics
export const mentorProfileViews: Counter<string> = getOrCreateCounter({
  name: 'getmentor_mentor_profile_views_total',
  help: 'Total number of mentor profile views',
  labelNames: [],
  registers: [register],
})

export const mentorSearches: Counter<string> = getOrCreateCounter({
  name: 'getmentor_mentor_searches_total',
  help: 'Total number of mentor searches performed (client-side)',
  labelNames: ['has_filters', 'search_type'],
  registers: [register],
})

// Export the register for Prometheus to scrape
export default register
