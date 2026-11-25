/**
 * Query/fragment parameters that act as credentials: the mentee/mentor/admin magic-link
 * `token` and the legacy review-link `request_id`. Telemetry must never record their values.
 */
const SECRET_PARAM_RE = /([?&#](?:token|request_id)=)[^&#\s"']*/gi

export function redactSecretUrlParams(value: string): string {
  return value.replace(SECRET_PARAM_RE, '$1[redacted]')
}

/** Redacts secret URL params in every string property (one level deep, plus nested $set objects). */
export function redactSecretUrlParamsInProperties<T extends Record<string, unknown>>(
  properties: T | undefined
): T | undefined {
  if (!properties) return properties
  const out: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(properties)) {
    if (typeof value === 'string') {
      out[key] = redactSecretUrlParams(value)
    } else if (value && typeof value === 'object' && !Array.isArray(value)) {
      out[key] = redactSecretUrlParamsInProperties(value as Record<string, unknown>)
    } else {
      out[key] = value
    }
  }
  return out as T
}
