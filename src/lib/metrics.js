import promClient from 'prom-client'

// Create a Registry to register the metrics
const register = new promClient.Registry()

// Add default metrics (CPU, memory, event loop lag, etc.)
promClient.collectDefaultMetrics({
  register,
  prefix: 'gm_nextjs_',
  gcDurationBuckets: [0.001, 0.01, 0.1, 1, 2, 5],
})

// Custom application metrics

// HTTP request duration histogram
export const httpRequestDuration = new promClient.Histogram({
  name: 'nextjs_http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10],
  registers: [register],
})

// HTTP request counter
export const httpRequestTotal = new promClient.Counter({
  name: 'nextjs_http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register],
})

// Active requests gauge
export const activeRequests = new promClient.Gauge({
  name: 'nextjs_http_active_requests',
  help: 'Number of active HTTP requests',
  labelNames: ['method', 'route'],
  registers: [register],
})

// Airtable API metrics
export const airtableRequestDuration = new promClient.Histogram({
  name: 'nextjs_airtable_request_duration_seconds',
  help: 'Duration of Airtable API requests in seconds',
  labelNames: ['operation', 'status'],
  buckets: [0.1, 0.5, 1, 2, 5, 10, 30],
  registers: [register],
})

export const airtableRequestTotal = new promClient.Counter({
  name: 'nextjs_airtable_requests_total',
  help: 'Total number of Airtable API requests',
  labelNames: ['operation', 'status'],
  registers: [register],
})

// Cache metrics
export const cacheHits = new promClient.Counter({
  name: 'nextjs_cache_hits_total',
  help: 'Total number of cache hits',
  labelNames: ['cache_name'],
  registers: [register],
})

export const cacheMisses = new promClient.Counter({
  name: 'nextjs_cache_misses_total',
  help: 'Total number of cache misses',
  labelNames: ['cache_name'],
  registers: [register],
})

export const cacheSize = new promClient.Gauge({
  name: 'nextjs_cache_size',
  help: 'Number of items in cache',
  labelNames: ['cache_name'],
  registers: [register],
})

// Azure Storage metrics
export const azureStorageRequestDuration = new promClient.Histogram({
  name: 'nextjs_azure_storage_request_duration_seconds',
  help: 'Duration of Azure Storage requests in seconds',
  labelNames: ['operation', 'status'],
  buckets: [0.1, 0.5, 1, 2, 5, 10],
  registers: [register],
})

export const azureStorageRequestTotal = new promClient.Counter({
  name: 'nextjs_azure_storage_requests_total',
  help: 'Total number of Azure Storage requests',
  labelNames: ['operation', 'status'],
  registers: [register],
})

// Business metrics
export const mentorProfileViews = new promClient.Counter({
  name: 'nextjs_mentor_profile_views_total',
  help: 'Total number of mentor profile views',
  labelNames: ['mentor_slug'],
  registers: [register],
})

export const contactFormSubmissions = new promClient.Counter({
  name: 'nextjs_contact_form_submissions_total',
  help: 'Total number of contact form submissions',
  labelNames: ['status'],
  registers: [register],
})

export const mentorSearches = new promClient.Counter({
  name: 'nextjs_mentor_searches_total',
  help: 'Total number of mentor searches performed',
  labelNames: ['has_filters', 'search_type'],
  registers: [register],
})

export const profileUpdates = new promClient.Counter({
  name: 'nextjs_profile_updates_total',
  help: 'Total number of mentor profile updates',
  labelNames: ['status'],
  registers: [register],
})

export const profilePictureUploads = new promClient.Counter({
  name: 'nextjs_profile_picture_uploads_total',
  help: 'Total number of profile picture uploads',
  labelNames: ['status'],
  registers: [register],
})

export const pageViews = new promClient.Counter({
  name: 'nextjs_page_views_total',
  help: 'Total number of page views (SSR)',
  labelNames: ['page'],
  registers: [register],
})

export const serverSideRenderDuration = new promClient.Histogram({
  name: 'nextjs_ssr_duration_seconds',
  help: 'Duration of server-side rendering in seconds',
  labelNames: ['page', 'status'],
  buckets: [0.1, 0.3, 0.5, 1, 2, 5, 10],
  registers: [register],
})

// Export the register for Prometheus to scrape
export default register
