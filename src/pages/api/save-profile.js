import { getGoApiClient } from '../../lib/go-api-client'
import { logError } from '../../lib/logger'
import { withObservability } from '../../lib/with-observability'

/**
 * SECURITY: Next.js API proxy for save-profile endpoint
 * This allows Go API to remain on localhost only (not publicly exposed)
 * Client -> Next.js API Route (this file) -> Go API (localhost)
 */
async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Extract auth headers from request
    const mentorId = req.headers['x-mentor-id']
    const authToken = req.headers['x-auth-token']

    if (!mentorId || !authToken) {
      return res.status(400).json({ error: 'Missing authentication headers' })
    }

    // Use Go API client to forward request
    const client = getGoApiClient()
    const data = await client.saveProfile(mentorId, authToken, req.body)

    return res.status(200).json(data)
  } catch (error) {
    logError(error, { context: 'save-profile-proxy', method: req.method, url: req.url })
    return res.status(500).json({ error: 'Internal server error' })
  }
}

export default withObservability(handler)
