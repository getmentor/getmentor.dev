import type { IncomingMessage, ServerResponse } from 'http'
import type { GetServerSideProps } from 'next'

/**
 * Magic-link token handoff, shared by the mentor, admin and mentee login flows.
 *
 * The emailed link is `<callback>?token=...`. Browser JavaScript must never see that
 * URL: PostHog and Faro initialise at module load and record the full address, and GTM
 * loads on mount. So the callback page's getServerSideProps moves the token into a
 * short-lived HttpOnly cookie that is sent only to the realm's verify route, and
 * redirects to the callback path without the query string. The client then POSTs to
 * verify, which reads the token only from that cookie and clears it.
 *
 * The GET never consumes the token, so email link scanners that fetch the URL can't use
 * it up; only the POST from the rendered page does.
 */

export interface LoginTokenRealm {
  /** Cookie holding the pending token, e.g. mentor_login_token */
  cookieName: string
  /** The only path the cookie is sent to */
  verifyPath: string
  /** Callback page path the emailed link points at */
  callbackPath: string
  /** Shape of a valid token for this realm (anything else is dropped) */
  tokenPattern: RegExp
}

export const MENTOR_LOGIN_TOKEN: LoginTokenRealm = {
  cookieName: 'mentor_login_token',
  verifyPath: '/api/mentor/auth/verify',
  callbackPath: '/mentor/auth/callback',
  tokenPattern: /^mtk_[0-9a-f]{64}_\d{1,20}$/,
}

export const ADMIN_LOGIN_TOKEN: LoginTokenRealm = {
  cookieName: 'admin_login_token',
  verifyPath: '/api/admin/auth/verify',
  callbackPath: '/admin/auth/callback',
  tokenPattern: /^atk_[0-9a-f]{64}_\d{1,20}$/,
}

export const MENTEE_LOGIN_TOKEN: LoginTokenRealm = {
  cookieName: 'mentee_login_token',
  verifyPath: '/api/mentee/auth/verify',
  callbackPath: '/mentee/auth/callback',
  tokenPattern: /^mntk_[0-9a-f]{64}$/,
}

const MAX_AGE_SECONDS = 15 * 60

function isSecureRequest(req: IncomingMessage): boolean {
  const host = req.headers.host || ''
  if (host.startsWith('localhost') || host.startsWith('127.0.0.1')) return false
  return process.env.NODE_ENV === 'production'
}

function buildCookie(
  realm: LoginTokenRealm,
  value: string,
  maxAge: number,
  secure: boolean
): string {
  return [
    `${realm.cookieName}=${value}`,
    `Path=${realm.verifyPath}`,
    `Max-Age=${maxAge}`,
    'HttpOnly',
    'SameSite=Lax',
    ...(secure ? ['Secure'] : []),
  ].join('; ')
}

export function isLoginToken(realm: LoginTokenRealm, value: unknown): value is string {
  return typeof value === 'string' && realm.tokenPattern.test(value)
}

export function setPendingLoginTokenCookie(
  realm: LoginTokenRealm,
  req: IncomingMessage,
  res: ServerResponse,
  token: string
): void {
  res.setHeader('Set-Cookie', buildCookie(realm, token, MAX_AGE_SECONDS, isSecureRequest(req)))
}

/** A Set-Cookie value that deletes the pending token cookie. */
export function clearPendingLoginTokenCookie(realm: LoginTokenRealm, req: IncomingMessage): string {
  return buildCookie(realm, '', 0, isSecureRequest(req))
}

export function readPendingLoginToken(
  realm: LoginTokenRealm,
  cookies: Partial<Record<string, string>>
): string | null {
  const value = cookies[realm.cookieName]
  return isLoginToken(realm, value) ? value : null
}

/** getServerSideProps for a callback page: stash ?token= in the cookie and drop it from the URL. */
export function loginCallbackServerSideProps(realm: LoginTokenRealm): GetServerSideProps {
  return async ({ req, res, query }) => {
    if (query.token !== undefined) {
      if (isLoginToken(realm, query.token)) {
        setPendingLoginTokenCookie(realm, req, res, query.token)
      }
      // Always drop the query string; a malformed token just fails verification.
      return { redirect: { destination: realm.callbackPath, permanent: false } }
    }
    res.setHeader('Cache-Control', 'private, no-store')
    return { props: {} }
  }
}
