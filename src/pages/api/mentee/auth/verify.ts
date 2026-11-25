import type { NextApiRequest, NextApiResponse } from 'next'
import { getGoApiClient } from '@/lib/go-api-client'
import { sendMenteeProxyError } from '@/lib/mentee-api-proxy'
import { clearPendingLoginTokenCookie, readPendingLoginToken } from '@/lib/mentee-login-token'
import { withObservability } from '@/lib/with-observability'

/**
 * POST /api/mentee/auth/verify
 * Exchange the one-time login token for a mentee session cookie. The token comes from
 * the HttpOnly mentee_login_token cookie that /mentee/auth/callback set server-side;
 * it is never in a URL the browser's scripts can read. The pending cookie is cleared
 * whatever the outcome.
 */
async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const clearPending = clearPendingLoginTokenCookie(req)
  const token = readPendingLoginToken(req.cookies)
  if (!token) {
    res.setHeader('Set-Cookie', clearPending)
    res.status(401).json({ success: false, error: 'Invalid token' })
    return
  }

  try {
    const { data, headers } = await getGoApiClient().menteeVerifyLogin(token)
    const sessionCookie = headers.get('set-cookie')
    res.setHeader('Set-Cookie', sessionCookie ? [sessionCookie, clearPending] : [clearPending])
    res.status(200).json(data)
  } catch (error) {
    res.setHeader('Set-Cookie', clearPending)
    sendMenteeProxyError(req, res, error, 'mentee-verify-login')
  }
}

export default withObservability(handler)
