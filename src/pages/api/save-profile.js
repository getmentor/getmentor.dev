import { goApiClient } from '../../lib/go-api-client'

/**
 * SECURITY: Next.js API proxy for save-profile endpoint
 * This allows Go API to remain on localhost only (not publicly exposed)
 * Client -> Next.js API Route (this file) -> Go API (localhost)
 */
export default async function handler(req, res) {
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

    // Forward request to Go API via localhost
    const response = await fetch(`${process.env.GO_API_URL || 'http://localhost:8080'}/api/save-profile`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Mentor-ID': mentorId,
        'X-Auth-Token': authToken,
      },
      body: JSON.stringify(req.body),
    })

    const data = await response.json()

    // Forward response status and data
    return res.status(response.status).json(data)
  } catch (error) {
    console.error('Save profile proxy error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
