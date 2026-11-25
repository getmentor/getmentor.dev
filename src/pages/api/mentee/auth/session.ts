import type { NextApiRequest, NextApiResponse } from 'next'
import { getGoApiClient } from '@/lib/go-api-client'
import { forwardSetCookie, sendMenteeProxyError } from '@/lib/mentee-api-proxy'
import { withObservability } from '@/lib/with-observability'

/**
 * GET /api/mentee/auth/session
 * Current mentee session (401 when there is none or it was revoked).
 */
async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const cookies = req.headers.cookie
  if (!cookies) {
    res.status(401).json({ success: false, error: 'Unauthorized' })
    return
  }

  try {
    const { data, headers } = await getGoApiClient().menteeGetSession(cookies)
    forwardSetCookie(res, headers)
    res.status(200).json(data)
  } catch (error) {
    sendMenteeProxyError(req, res, error, 'mentee-session')
  }
}

export default withObservability(handler)
