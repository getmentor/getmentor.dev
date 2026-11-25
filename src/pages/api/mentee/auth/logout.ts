import type { NextApiRequest, NextApiResponse } from 'next'
import { getGoApiClient } from '@/lib/go-api-client'
import { forwardSetCookie, sendMenteeProxyError } from '@/lib/mentee-api-proxy'
import { withObservability } from '@/lib/with-observability'

/**
 * POST /api/mentee/auth/logout
 * Revokes every session of the mentee (not only this browser's) and clears the cookie.
 */
async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  try {
    const { data, headers } = await getGoApiClient().menteeLogout(req.headers.cookie || '')
    forwardSetCookie(res, headers)
    res.status(200).json(data)
  } catch (error) {
    sendMenteeProxyError(req, res, error, 'mentee-logout')
  }
}

export default withObservability(handler)
