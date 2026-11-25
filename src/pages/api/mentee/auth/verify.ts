import type { NextApiRequest, NextApiResponse } from 'next'
import { getGoApiClient } from '@/lib/go-api-client'
import { forwardSetCookie, sendMenteeProxyError } from '@/lib/mentee-api-proxy'
import { withObservability } from '@/lib/with-observability'

/**
 * POST /api/mentee/auth/verify
 * Exchange the emailed one-time token for a mentee session cookie.
 */
async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const token: unknown = req.body?.token
  if (typeof token !== 'string' || token.length < 20 || token.length > 200) {
    res.status(400).json({ success: false, message: 'Token is required' })
    return
  }

  try {
    const { data, headers } = await getGoApiClient().menteeVerifyLogin(token)
    forwardSetCookie(res, headers)
    res.status(200).json(data)
  } catch (error) {
    sendMenteeProxyError(req, res, error, 'mentee-verify-login')
  }
}

export default withObservability(handler)
