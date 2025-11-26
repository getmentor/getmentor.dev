import { getGoApiClient } from '../../lib/go-api-client'
import { logError } from '../../lib/logger'

/**
 * SECURITY: Next.js API proxy for contact-mentor endpoint
 * This allows Go API to remain on localhost only (not publicly exposed)
 * Client -> Next.js API Route (this file) -> Go API (localhost)
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Use Go API client to forward request
    const client = getGoApiClient()
    const data = await client.contactMentor(req.body)

    return res.status(200).json(data)
  } catch (error) {
    logError(error, { context: 'contact-mentor-proxy', method: req.method, url: req.url })
    return res.status(500).json({ error: 'Internal server error' })
  }
}
