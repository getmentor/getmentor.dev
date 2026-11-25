import type { NextApiRequest, NextApiResponse } from 'next'
import { getGoApiClient } from '@/lib/go-api-client'
import { sendMenteeProxyError } from '@/lib/mentee-api-proxy'
import { withObservability } from '@/lib/with-observability'

/**
 * GET /api/mentee/requests
 * Every request sent from the logged-in mentee's email. Visibility rules are applied by the Go API.
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
    const data = await getGoApiClient().menteeGetRequests(cookies)
    res.setHeader('Cache-Control', 'private, no-store')
    res.status(200).json(data)
  } catch (error) {
    sendMenteeProxyError(req, res, error, 'mentee-requests')
  }
}

export default withObservability(handler)
