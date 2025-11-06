import { getGoApiClient } from '../../lib/go-api-client'

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
    console.error('Contact mentor proxy error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
