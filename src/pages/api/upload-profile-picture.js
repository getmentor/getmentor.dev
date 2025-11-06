import { getGoApiClient } from '../../lib/go-api-client'

/**
 * SECURITY: Next.js API proxy for upload-profile-picture endpoint
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

    // Use Go API client to forward request
    const client = getGoApiClient()
    const data = await client.uploadProfilePicture(mentorId, authToken, req.body)

    return res.status(200).json(data)
  } catch (error) {
    console.error('Upload profile picture proxy error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
