import type { NextApiRequest, NextApiResponse } from 'next'
import { getGoApiClient, HttpError } from '@/lib/go-api-client'
import { logError } from '@/lib/logger'
import { withObservability } from '@/lib/with-observability'

/**
 * GET /api/mentor/requests?group=active|past
 * Get mentor's requests
 */
async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const cookies = req.headers.cookie
  if (!cookies) {
    res.status(401).json({ error: 'Unauthorized' })
    return
  }

  const group = req.query.group as string
  if (!group || (group !== 'active' && group !== 'past')) {
    res.status(400).json({ error: 'Invalid group parameter. Must be "active" or "past"' })
    return
  }

  try {
    const client = getGoApiClient()
    const data = await client.mentorGetRequests(cookies, group)
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
      logError(error, { context: 'mentor-get-requests', method: req.method, url: req.url })
    }
    res.status(500).json({ error: 'Internal server error' })
  }
}

export default withObservability(handler)
