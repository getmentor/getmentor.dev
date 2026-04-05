// report-error.ts - Unified error reporting to both Grafana Faro and PostHog

import { pushError } from './faro'
import { captureException } from './posthog'

/**
 * Report an error to all observability systems (Faro + PostHog).
 * Use this instead of calling pushError or captureException directly.
 */
export function reportError(error: Error, context?: Record<string, string>): void {
  // Send to Grafana Faro (client-side only, no-ops if Faro not initialized)
  pushError(error, context)

  // Send to PostHog (client-side only, no-ops if PostHog not initialized)
  captureException(error, context)
}
