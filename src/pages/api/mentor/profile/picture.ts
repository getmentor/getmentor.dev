import type { NextApiRequest, NextApiResponse } from 'next'
import { getGoApiClient, HttpError } from '@/lib/go-api-client'
import { logError } from '@/lib/logger'
import { withObservability } from '@/lib/with-observability'

/**
 * POST /api/mentor/profile/picture - Upload mentor's profile picture
 *
 * Requires session cookie authentication.
 * Body: { image: string } - Base64 encoded image data
 */
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

  const imageData = req.body

  if (!imageData || typeof imageData.image !== 'string') {
    res.status(400).json({ error: 'Invalid image data' })
    return
  }

  try {
    const client = getGoApiClient()
    const data = await client.mentorUploadProfilePicture(cookies, imageData)
    res.status(200).json(data)
  } catch (error) {
    if (error instanceof HttpError) {
      const status = error.statusCode >= 400 && error.statusCode < 600 ? error.statusCode : 500
      try {
        const errorData = JSON.parse(error.body)
        res.status(status).json(errorData)
      } catch {
        res.status(status).json({ error: error.message })
      }
      return
    }

    if (error instanceof Error) {
      logError(error, { context: 'mentor-upload-picture', method: req.method, url: req.url })
    }
    res.status(500).json({ error: 'Internal server error' })
  }
}

export default withObservability(handler)
