import type { NextApiRequest, NextApiResponse } from 'next'
import { getGoApiClient, HttpError } from '@/lib/go-api-client'
import {
  clearPendingLoginTokenCookie,
  ADMIN_LOGIN_TOKEN,
  readPendingLoginToken,
} from '@/lib/login-token-handoff'
import { logError } from '@/lib/logger'
import { withObservability } from '@/lib/with-observability'

/**
 * POST /api/admin/auth/verify
 * Exchange the one-time login token for a session cookie. The token comes only from the
 * HttpOnly admin_login_token cookie that /admin/auth/callback set server-side, so it
 * is never in a URL that browser scripts (telemetry included) can read. The pending
 * cookie is cleared whatever the outcome.
 */
async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const clearPending = clearPendingLoginTokenCookie(ADMIN_LOGIN_TOKEN, req)
  const token = readPendingLoginToken(ADMIN_LOGIN_TOKEN, req.cookies)
  if (!token) {
    res.setHeader('Set-Cookie', clearPending)
    res.status(401).json({ success: false, error: 'Invalid token' })
    return
  }

  try {
    const { data, headers } = await getGoApiClient().adminVerifyLogin(token)
    const sessionCookie = headers.get('set-cookie')
    res.setHeader('Set-Cookie', sessionCookie ? [sessionCookie, clearPending] : [clearPending])
    res.status(200).json(data)
  } catch (error) {
    res.setHeader('Set-Cookie', clearPending)
    if (error instanceof HttpError) {
      const status = error.statusCode >= 400 && error.statusCode < 600 ? error.statusCode : 500
      try {
        res.status(status).json(JSON.parse(error.body))
      } catch {
        res.status(status).json({ success: false, message: error.message })
      }
      return
    }

    if (error instanceof Error) {
      logError(error, { context: 'admin-verify-login', method: req.method })
    }
    res.status(500).json({ success: false, message: 'Internal server error' })
  }
}

export default withObservability(handler)
