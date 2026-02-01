/**
 * Simplified observability instrumentation for frontend Next.js application
 * Tracks HTTP requests, duration, and errors for remaining API routes
 */

import type { NextApiRequest, NextApiResponse } from 'next'
import type { Histogram } from 'prom-client'
import { httpRequestDuration, httpRequestTotal, activeRequests } from './metrics'
import { logHttpRequest, logError } from './logger'

type NextApiHandler = (req: NextApiRequest, res: NextApiResponse) => Promise<void> | void

/**
 * Normalize dynamic route segments to prevent cardinality explosion in metrics.
 * Converts actual IDs to route templates (e.g., /api/mentor/requests/rec123 -> /api/mentor/requests/:id)
 */
function normalizeRoute(url: string): string {
  const path = url.split('?')[0]

  // Pattern for PostgreSQL UUIDs (8-4-4-4-12 hex format)
  // Used in: /api/mentor/requests/[id], /api/mentor/requests/[id]/status, etc.
  const normalized = path
    // Normalize /api/mentor/requests/uuid... paths
    .replace(
      /\/api\/mentor\/requests\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/,
      '/api/mentor/requests/:id'
    )
    // Normalize /mentor/[slug] patterns (mentor slugs are lowercase with hyphens)
    .replace(/\/mentor\/[a-z0-9-]+(?:\/|$)/, '/mentor/:slug/')
    // Remove trailing slash for consistency
    .replace(/\/$/, '')

  return normalized || 'unknown'
}

/**
 * Higher-order function that wraps API routes with observability instrumentation
 */
export function withObservability(handler: NextApiHandler): NextApiHandler {
  return async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
    const start = Date.now()
    const route = normalizeRoute(req.url || '')
    const method = req.method || 'UNKNOWN'

    // Track active requests
    activeRequests.inc({ http_request_method: method, http_route: route })

    // Patch res.end to capture status code and duration
    const originalEnd = res.end.bind(res)

    res.end = ((...args: Parameters<typeof originalEnd>) => {
      const statusCode = res.statusCode
      const duration = (Date.now() - start) / 1000 // Convert to seconds

      // Record metrics
      httpRequestDuration.observe(
        { http_request_method: method, http_route: route, http_response_status_code: statusCode },
        duration
      )
      httpRequestTotal.inc({
        http_request_method: method,
        http_route: route,
        http_response_status_code: statusCode,
      })
      activeRequests.dec({ http_request_method: method, http_route: route })

      // Log the request
      logHttpRequest(req, res, duration * 1000) // Convert back to ms for logging

      return originalEnd(...args)
    }) as NextApiResponse['end']

    try {
      // Call the actual handler
      await handler(req, res)
    } catch (error) {
      // Log the error
      if (error instanceof Error) {
        logError(error, {
          method,
          route,
          url: req.url,
        })
      }

      // Re-throw to let Next.js handle it
      throw error
    }
  }
}

interface MetricLabels {
  [key: string]: string | number
}

/**
 * Helper to measure async operations with metrics
 */
export async function measureAsync<T>(
  metric: Histogram<string>,
  labels: MetricLabels,
  operation: () => Promise<T>
): Promise<T> {
  const end = metric.startTimer(labels)
  try {
    const result = await operation()
    end()
    return result
  } catch (error) {
    end()
    throw error
  }
}

/**
 * Helper to measure sync operations with metrics
 */
export function measureSync<T>(
  metric: Histogram<string>,
  labels: MetricLabels,
  operation: () => T
): T {
  const end = metric.startTimer(labels)
  try {
    const result = operation()
    end()
    return result
  } catch (error) {
    end()
    throw error
  }
}
