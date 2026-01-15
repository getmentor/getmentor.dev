import type { NextApiRequest, NextApiResponse } from 'next'
import { getGoApiClient, HttpError } from '@/lib/go-api-client'
import { logError } from '@/lib/logger'
import { withObservability } from '@/lib/with-observability'

/**
 * GET /api/mentor/profile - Get mentor's own profile
 * POST /api/mentor/profile - Update mentor's profile
 *
 * Requires session cookie authentication.
 */
async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  const cookies = req.headers.cookie
  if (!cookies) {
    res.status(401).json({ error: 'Unauthorized' })
    return
  }

  const client = getGoApiClient()

  if (req.method === 'GET') {
    try {
      const data = await client.mentorGetProfile(cookies)
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
        logError(error, { context: 'mentor-get-profile', method: req.method, url: req.url })
      }
      res.status(500).json({ error: 'Internal server error' })
    }
  } else if (req.method === 'POST') {
    const profileData = req.body

    if (!profileData || typeof profileData !== 'object') {
      res.status(400).json({ error: 'Invalid profile data' })
      return
    }

    try {
      const data = await client.mentorSaveProfile(cookies, profileData)
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
        logError(error, { context: 'mentor-save-profile', method: req.method, url: req.url })
      }
      res.status(500).json({ error: 'Internal server error' })
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' })
  }
}

export default withObservability(handler)
