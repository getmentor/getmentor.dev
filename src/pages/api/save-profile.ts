import type { NextApiRequest, NextApiResponse } from 'next'
import { getGoApiClient } from '@/lib/go-api-client'
import { logError } from '@/lib/logger'
import { withObservability } from '@/lib/with-observability'
import type { SaveProfileRequest } from '@/types'

/**
 * SECURITY: Next.js API proxy for save-profile endpoint
 * This allows Go API to remain on localhost only (not publicly exposed)
 * Client -> Next.js API Route (this file) -> Go API (localhost)
 */
async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  try {
    // Extract auth headers from request
    const mentorIdHeader = req.headers['x-mentor-id']
    const authTokenHeader = req.headers['x-auth-token']

    const mentorId = Array.isArray(mentorIdHeader) ? mentorIdHeader[0] : mentorIdHeader
    const authToken = Array.isArray(authTokenHeader) ? authTokenHeader[0] : authTokenHeader

    if (!mentorId || !authToken) {
      res.status(400).json({ error: 'Missing authentication headers' })
      return
    }

    // Use Go API client to forward request
    const client = getGoApiClient()
    const data = await client.saveProfile(mentorId, authToken, req.body as SaveProfileRequest)

    res.status(200).json(data)
  } catch (error) {
    if (error instanceof Error) {
      logError(error, { context: 'save-profile-proxy', method: req.method, url: req.url })
    }
    res.status(500).json({ error: 'Internal server error' })
  }
}

export default withObservability(handler)
