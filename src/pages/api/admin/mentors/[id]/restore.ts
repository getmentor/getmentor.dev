import type { NextApiRequest, NextApiResponse } from 'next'
import { getGoApiClient } from '@/lib/go-api-client'
import { getSingleQueryParam, sendAdminProxyError } from '@/lib/admin-api-proxy'
import { withObservability } from '@/lib/with-observability'

async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const cookies = req.headers.cookie
  if (!cookies) {
    res.status(401).json({ error: 'Unauthorized' })
    return
  }

  const mentorId = getSingleQueryParam(req.query.id)
  if (!mentorId) {
    res.status(400).json({ error: 'Invalid mentor ID' })
    return
  }

  try {
    const client = getGoApiClient()
    const mentor = await client.adminRestoreMentor(cookies, mentorId)
    res.status(200).json({ mentor })
  } catch (error) {
    sendAdminProxyError(req, res, error, 'admin-restore-mentor')
  }
}

export default withObservability(handler)
