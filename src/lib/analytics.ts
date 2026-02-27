type AnalyticsProperties = Record<string, unknown>

type PendingCommand =
  | { type: 'track'; event: string; properties?: AnalyticsProperties }
  | { type: 'identify'; distinctId: string; properties?: AnalyticsProperties }
  | { type: 'reset' }

interface MixpanelClient {
  track: (name: string, params?: AnalyticsProperties) => void
  identify: (id: string) => void
  reset?: () => void
  people?: {
    set: (props: AnalyticsProperties) => void
  }
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
const EVENT_VERSION = 'v1'
const FLUSH_INTERVAL_MS = 250
const MAX_QUEUE_SIZE = 200
const ENVIRONMENT =
  process.env.NEXT_PUBLIC_APP_ENV || process.env.NEXT_PUBLIC_VERCEL_ENV || process.env.NODE_ENV

const queue: PendingCommand[] = []
let flushTimer: number | null = null

const blockedPropertyFragments = [
  'email',
  'name',
  'telegram',
  'intro',
  'description',
  'review',
  'about',
  'competencies',
  'loginurl',
]

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

function normalizePropertyKey(key: string): string {
  return key.toLowerCase().replace(/[^a-z0-9]/g, '')
}

function isBlockedProperty(key: string): boolean {
  const normalized = normalizePropertyKey(key)
  return blockedPropertyFragments.some((fragment) => normalized.includes(fragment))
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

function executeCommand(command: PendingCommand): void {
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

function flushQueue(): void {
  const mixpanel = getMixpanel()
  if (!mixpanel) {
    scheduleFlush()
    return
  }

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
  scheduleFlush()
}

const analytics: Analytics = {
  events: analyticsEvents,

  event(name: AnalyticsEventName | string, params?: AnalyticsProperties): void {
    const eventName = name.trim()
    if (!eventName || typeof window === 'undefined') return

    if (getMixpanel()) {
      executeCommand({ type: 'track', event: eventName, properties: params })
      return
    }

    enqueue({ type: 'track', event: eventName, properties: params })
  },

  identify(distinctId: string, params?: AnalyticsProperties): void {
    const normalizedDistinctId = distinctId.trim()
    if (!normalizedDistinctId || typeof window === 'undefined') return

    if (getMixpanel()) {
      executeCommand({ type: 'identify', distinctId: normalizedDistinctId, properties: params })
      return
    }

    enqueue({ type: 'identify', distinctId: normalizedDistinctId, properties: params })
  },

  reset(): void {
    if (typeof window === 'undefined') return

    if (getMixpanel()) {
      executeCommand({ type: 'reset' })
      return
    }

    enqueue({ type: 'reset' })
  },
}

export default analytics
