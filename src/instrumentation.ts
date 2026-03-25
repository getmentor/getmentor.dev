// instrumentation.ts - Next.js server-side OpenTelemetry instrumentation

import { registerServerTracing } from './lib/tracing-server'
import logger, { getTraceContext } from './lib/logger'
import { getPostHogServerClient } from './lib/posthog-server'

export async function register(): Promise<void> {
  // eslint-disable-next-line no-console
  console.log('[Instrumentation] Initializing observability stack...')

  try {
    // Initialize OpenTelemetry server-side tracing
    registerServerTracing()

    // Initialize logger
    logger.info('Observability instrumentation initialized', {
      runtime: 'nodejs',
      env: process.env.NODE_ENV,
      ...getTraceContext(),
    })
  } catch (error: unknown) {
    console.error('[Instrumentation] Failed to initialize observability:', error)
  }
}

export async function onRequestError(
  error: { message: string; digest?: string; stack?: string },
  request: { method: string; url: string; headers: Record<string, string> },
  context: { routerKind: string; routePath: string; routeType: string; renderSource: string }
): Promise<void> {
  const posthog = getPostHogServerClient()
  if (!posthog) return

  const sessionId = request.headers['x-posthog-session-id']
  const distinctId = request.headers['x-posthog-distinct-id'] || 'anonymous'

  posthog.captureException(error, distinctId, {
    $session_id: sessionId,
    $posthog_route: context.routePath,
    $posthog_route_type: context.routeType,
    $posthog_render_source: context.renderSource,
    environment: process.env.NEXT_PUBLIC_APP_ENV || process.env.NODE_ENV,
    service_version: process.env.NEXT_PUBLIC_O11Y_FE_SERVICE_VERSION || '1.0.0',
  })

  await posthog.flush()
}
