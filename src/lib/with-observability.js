import {
  httpRequestDuration,
  httpRequestTotal,
  activeRequests,
} from './metrics'
import { logHttpRequest, logError } from './logger'

/**
 * Higher-order function that wraps API routes with observability instrumentation
 * @param {Function} handler - The API route handler
 * @returns {Function} - Wrapped handler with metrics and logging
 */
export function withObservability(handler) {
  return async (req, res) => {
    const start = Date.now()
    const route = req.url?.split('?')[0] || 'unknown'
    const method = req.method || 'UNKNOWN'

    // Track active requests
    activeRequests.inc({ method, route })

    // Patch res.end to capture status code and duration
    const originalEnd = res.end
    let statusCode = 200

    res.end = function (...args) {
      statusCode = res.statusCode
      const duration = (Date.now() - start) / 1000 // Convert to seconds

      // Record metrics
      httpRequestDuration.observe({ method, route, status_code: statusCode }, duration)
      httpRequestTotal.inc({ method, route, status_code: statusCode })
      activeRequests.dec({ method, route })

      // Log the request
      logHttpRequest(req, res, duration * 1000) // Convert back to ms for logging

      return originalEnd.apply(this, args)
    }

    try {
      // Call the actual handler
      return await handler(req, res)
    } catch (error) {
      // Log the error
      logError(error, {
        method,
        route,
        url: req.url,
      })

      // Re-throw to let Next.js handle it
      throw error
    }
  }
}

/**
 * Helper to measure async operations with metrics
 * @param {Object} metric - Histogram metric
 * @param {Object} labels - Metric labels
 * @param {Function} operation - Async operation to measure
 * @returns {Promise} - Result of the operation
 */
export async function measureAsync(metric, labels, operation) {
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
 * @param {Object} metric - Histogram metric
 * @param {Object} labels - Metric labels
 * @param {Function} operation - Sync operation to measure
 * @returns {*} - Result of the operation
 */
export function measureSync(metric, labels, operation) {
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
