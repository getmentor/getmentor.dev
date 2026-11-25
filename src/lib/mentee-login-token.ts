import type { IncomingMessage, ServerResponse } from 'http'

/**
 * The magic-link token must never be visible to browser JavaScript in the address bar:
 * PostHog and Faro initialise at module load and record the full URL. So the callback
 * page moves it server-side into a short-lived HttpOnly cookie that is sent only to the
 * verify route, and redirects to the same page without the query string.
 */
export const MENTEE_LOGIN_TOKEN_COOKIE = 'mentee_login_token'
export const MENTEE_VERIFY_PATH = '/api/mentee/auth/verify'
export const MENTEE_CALLBACK_PATH = '/mentee/auth/callback'
const MAX_AGE_SECONDS = 15 * 60

const TOKEN_RE = /^mntk_[0-9a-f]{64}$/

export function isMenteeLoginToken(value: unknown): value is string {
  return typeof value === 'string' && TOKEN_RE.test(value)
}

function isSecureRequest(req: IncomingMessage): boolean {
  const host = req.headers.host || ''
  if (host.startsWith('localhost') || host.startsWith('127.0.0.1')) return false
  return process.env.NODE_ENV === 'production'
}

function cookie(value: string, maxAge: number, secure: boolean): string {
  return [
    `${MENTEE_LOGIN_TOKEN_COOKIE}=${value}`,
    `Path=${MENTEE_VERIFY_PATH}`,
    `Max-Age=${maxAge}`,
    'HttpOnly',
    'SameSite=Lax',
    ...(secure ? ['Secure'] : []),
  ].join('; ')
}

export function setPendingLoginTokenCookie(
  req: IncomingMessage,
  res: ServerResponse,
  token: string
): void {
  res.setHeader('Set-Cookie', cookie(token, MAX_AGE_SECONDS, isSecureRequest(req)))
}

export function clearPendingLoginTokenCookie(req: IncomingMessage): string {
  return cookie('', 0, isSecureRequest(req))
}

export function readPendingLoginToken(cookies: Partial<Record<string, string>>): string | null {
  const value = cookies[MENTEE_LOGIN_TOKEN_COOKIE]
  return isMenteeLoginToken(value) ? value : null
}
