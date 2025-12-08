/**
 * Simplified observability instrumentation for frontend Next.js application
 * Tracks HTTP requests, duration, and errors for remaining API routes
 */

import type { NextApiRequest, NextApiResponse } from 'next'
import type { Histogram } from 'prom-client'
import { httpRequestDuration, httpRequestTotal, activeRequests } from './metrics'
import { logHttpRequest, logError } from './logger'

type NextApiHandler = (req: NextApiRequest, res: NextApiResponse) => Promise<void> | void

interface ExtendedResponse extends NextApiResponse {
  end: (cb?: () => void) => NextApiResponse
}

/**
 * Higher-order function that wraps API routes with observability instrumentation
 */
export function withObservability(handler: NextApiHandler): NextApiHandler {
  return async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
    const start = Date.now()
    const route = req.url?.split('?')[0] || 'unknown'
    const method = req.method || 'UNKNOWN'

    // Track active requests
    activeRequests.inc({ method, route })

    // Patch res.end to capture status code and duration
    const originalEnd = (res as ExtendedResponse).end.bind(res)

    ;(res as ExtendedResponse).end = function (
      this: NextApiResponse,
      ...args: Parameters<typeof originalEnd>
    ): NextApiResponse {
      const statusCode = res.statusCode
      const duration = (Date.now() - start) / 1000 // Convert to seconds

      // Record metrics
      httpRequestDuration.observe({ method, route, status_code: statusCode }, duration)
      httpRequestTotal.inc({ method, route, status_code: statusCode })
      activeRequests.dec({ method, route })

      // Log the request
      logHttpRequest(req, res, duration * 1000) // Convert back to ms for logging

      return originalEnd(...args)
    }

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
