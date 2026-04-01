import { getPostHogClient } from '@/lib/posthog'

type AnalyticsProperties = Record<string, unknown>

type PendingCommand =
  | { type: 'track'; event: string; properties?: AnalyticsProperties }
  | { type: 'identify'; distinctId: string; properties?: AnalyticsProperties }
  | { type: 'reset' }

type AnalyticsProvider = 'none' | 'mixpanel' | 'posthog' | 'dual'

interface MixpanelClient {
  track: (name: string, params?: AnalyticsProperties) => void
  identify: (id: string) => void
  reset?: () => void
  people?: {
    set: (props: AnalyticsProperties) => void
  }
}

interface PostHogClient {
  capture: (name: string, properties?: AnalyticsProperties) => void
  identify: (id: string, properties?: AnalyticsProperties) => void
  reset?: () => void
}

export const analyticsEvents = {
  HOME_PAGE_VIEWED: 'home_page_viewed',
  ONTICO_PAGE_VIEWED: 'ontico_page_viewed',
  SPONSORS_BANNER_VIEWED: 'sponsors_banner_viewed',

  MENTOR_PROFILE_VIEWED: 'mentor_profile_viewed',
  MENTOR_CONTACT_PAGE_VIEWED: 'mentor_contact_page_viewed',
  MENTEE_CONTACT_SUBMITTED: 'mentee_contact_submitted',

  MENTOR_REGISTRATION_PAGE_VIEWED: 'mentor_registration_page_viewed',
  MENTOR_REGISTRATION_SUBMITTED: 'mentor_registration_submitted',

  MENTORS_SEARCH_USED: 'mentors_search_used',
  MENTORS_LIST_LOAD_MORE_CLICKED: 'mentors_list_load_more_clicked',
  MENTOR_FILTERS_INITIALIZED_FROM_URL: 'mentor_filters_initialized_from_url',
  MENTOR_FILTERS_RESET: 'mentor_filters_reset',
  MENTOR_FILTER_CHANGED: 'mentor_filter_changed',

  MENTOR_AUTH_LOGIN_REQUESTED: 'mentor_auth_login_requested',
  MENTOR_AUTH_LOGIN_VERIFIED: 'mentor_auth_login_verified',
  MENTOR_AUTH_LOGOUT: 'mentor_auth_logout',
  ADMIN_AUTH_LOGIN_REQUESTED: 'admin_auth_login_requested',
  ADMIN_AUTH_LOGIN_VERIFIED: 'admin_auth_login_verified',
  ADMIN_AUTH_LOGOUT: 'admin_auth_logout',
} as const

export type AnalyticsEventName = (typeof analyticsEvents)[keyof typeof analyticsEvents]

interface Analytics {
  events: typeof analyticsEvents
  event: (name: AnalyticsEventName | string, params?: AnalyticsProperties) => void
  identify: (distinctId: string, params?: AnalyticsProperties) => void
  reset: () => void
}

const SOURCE_SYSTEM = 'frontend'
const EVENT_VERSION =
  process.env.NEXT_PUBLIC_ANALYTICS_EVENT_VERSION ||
  process.env.NEXT_PUBLIC_MIXPANEL_EVENT_VERSION ||
  'v1'
const FLUSH_INTERVAL_MS = 250
const MAX_QUEUE_SIZE = 200
const MAX_FLUSH_RETRIES = 20
const ENVIRONMENT =
  process.env.NEXT_PUBLIC_APP_ENV || process.env.NEXT_PUBLIC_VERCEL_ENV || process.env.NODE_ENV

const ANALYTICS_PROVIDER = (process.env.NEXT_PUBLIC_ANALYTICS_PROVIDER || '').trim().toLowerCase()

const queue: PendingCommand[] = []
let flushTimer: number | null = null
let flushRetries = 0

const blockedPropertyKeys = new Set([
  'email',
  'mentoremail',
  'moderatoremail',
  'name',
  'mentorname',
  'moderatorname',
  'telegram',
  'telegramusername',
  'intro',
  'description',
  'review',
  'mentorreview',
  'platformreview',
  'improvements',
  'about',
  'competencies',
  'loginurl',
])

function resolveProvider(): AnalyticsProvider {
  const explicit = ANALYTICS_PROVIDER

  if (explicit === 'none') return 'none'
  if (explicit === 'mixpanel') return 'mixpanel'
  if (explicit === 'posthog') return 'posthog'
  if (explicit === 'dual') return 'dual'

  return 'mixpanel'
}

const provider = resolveProvider()

function getMixpanel(): MixpanelClient | null {
  if (typeof window === 'undefined') return null

  const mixpanel = window.mixpanel
  if (
    !mixpanel ||
    typeof mixpanel.track !== 'function' ||
    typeof mixpanel.identify !== 'function'
  ) {
    return null
  }
  return mixpanel as MixpanelClient
}

function getPostHog(): PostHogClient | null {
  const client = getPostHogClient()
  if (!client) return null
  return client as unknown as PostHogClient
}

function normalizePropertyKey(key: string): string {
  return key.toLowerCase().replace(/[^a-z0-9]/g, '')
}

function isBlockedProperty(key: string): boolean {
  const normalized = normalizePropertyKey(key)
  return blockedPropertyKeys.has(normalized)
}

function trimString(value: string): string {
  const trimmed = value.trim()
  return trimmed.length <= 512 ? trimmed : trimmed.slice(0, 512)
}

function sanitizeProperties(params?: AnalyticsProperties): AnalyticsProperties {
  if (!params) return {}

  const sanitized: AnalyticsProperties = {}
  for (const [key, value] of Object.entries(params)) {
    if (!key || value === undefined || value === null || isBlockedProperty(key)) {
      continue
    }

    if (typeof value === 'string') {
      sanitized[key] = trimString(value)
      continue
    }

    sanitized[key] = value
  }

  return sanitized
}

function withCommonProperties(params?: AnalyticsProperties): AnalyticsProperties {
  return {
    ...sanitizeProperties(params),
    source_system: SOURCE_SYSTEM,
    environment: ENVIRONMENT || 'unknown',
    event_version: EVENT_VERSION,
  }
}

function canFlush(providerName: AnalyticsProvider): boolean {
  if (providerName === 'none') return false
  if (providerName === 'mixpanel') return getMixpanel() !== null
  if (providerName === 'posthog') return getPostHog() !== null
  return getMixpanel() !== null || getPostHog() !== null
}

function executeCommand(command: PendingCommand): void {
  if (provider === 'none' || typeof window === 'undefined') {
    return
  }

  if (provider === 'mixpanel') {
    executeMixpanelCommand(command)
    return
  }

  if (provider === 'posthog') {
    executePostHogCommand(command)
    return
  }

  if (provider === 'dual') {
    executePostHogCommand(command)
    executeMixpanelCommand(command)
  }
}

function executeMixpanelCommand(command: PendingCommand): void {
  const mixpanel = getMixpanel()
  if (!mixpanel) return

  if (command.type === 'track') {
    mixpanel.track(command.event, withCommonProperties(command.properties))
    return
  }

  if (command.type === 'identify') {
    mixpanel.identify(command.distinctId)
    if (command.properties && mixpanel.people?.set) {
      mixpanel.people.set(sanitizeProperties(command.properties))
    }
    return
  }

  if (command.type === 'reset') {
    mixpanel.reset?.()
  }
}

function executePostHogCommand(command: PendingCommand): void {
  const posthog = getPostHog()
  if (!posthog) return

  if (command.type === 'track') {
    posthog.capture(command.event, withCommonProperties(command.properties))
    return
  }

  if (command.type === 'identify') {
    posthog.identify(command.distinctId, sanitizeProperties(command.properties))
    return
  }

  if (command.type === 'reset') {
    posthog.reset?.()
  }
}

function flushQueue(): void {
  if (!canFlush(provider)) {
    flushRetries += 1
    if (flushRetries >= MAX_FLUSH_RETRIES) {
      queue.length = 0
      return
    }
    scheduleFlush()
    return
  }

  flushRetries = 0
  while (queue.length > 0) {
    const command = queue.shift()
    if (!command) break
    executeCommand(command)
  }
}

function scheduleFlush(): void {
  if (typeof window === 'undefined' || flushTimer !== null) return
  flushTimer = window.setTimeout(() => {
    flushTimer = null
    flushQueue()
  }, FLUSH_INTERVAL_MS)
}

function enqueue(command: PendingCommand): void {
  if (queue.length >= MAX_QUEUE_SIZE) {
    queue.shift()
  }
  queue.push(command)
  flushRetries = 0
  scheduleFlush()
}

const analytics: Analytics = {
  events: analyticsEvents,

  event(name: AnalyticsEventName | string, params?: AnalyticsProperties): void {
    const eventName = name.trim()
    if (!eventName || typeof window === 'undefined') return

    if (canFlush(provider)) {
      flushQueue()
      executeCommand({ type: 'track', event: eventName, properties: params })
      return
    }

    enqueue({ type: 'track', event: eventName, properties: params })
  },

  identify(distinctId: string, params?: AnalyticsProperties): void {
    const normalizedDistinctId = distinctId.trim()
    if (!normalizedDistinctId || typeof window === 'undefined') return

    if (canFlush(provider)) {
      flushQueue()
      executeCommand({ type: 'identify', distinctId: normalizedDistinctId, properties: params })
      return
    }

    enqueue({ type: 'identify', distinctId: normalizedDistinctId, properties: params })
  },

  reset(): void {
    if (typeof window === 'undefined') return

    if (canFlush(provider)) {
      flushQueue()
      executeCommand({ type: 'reset' })
      return
    }

    enqueue({ type: 'reset' })
  },
}

export default analytics
