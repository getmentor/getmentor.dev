import type { NextApiRequest, NextApiResponse } from 'next'
import { getGoApiClient, HttpError } from '@/lib/go-api-client'
import { logError } from '@/lib/logger'
import { withObservability } from '@/lib/with-observability'
import type { AdminStatusUpdateRequest } from '@/types'

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

  const { id } = req.query
  const mentorId = Array.isArray(id) ? id[0] : id
  if (!mentorId || typeof mentorId !== 'string') {
    res.status(400).json({ error: 'Invalid mentor ID' })
    return
  }

  const body = req.body as AdminStatusUpdateRequest
  if (!body || (body.status !== 'active' && body.status !== 'inactive')) {
    res.status(400).json({ error: 'Status must be active or inactive' })
    return
  }

  try {
    const client = getGoApiClient()
    const mentor = await client.adminUpdateMentorStatus(cookies, mentorId, body)
    res.status(200).json({ mentor })
  } catch (error) {
    if (error instanceof HttpError) {
      const statusCode = error.statusCode >= 400 && error.statusCode < 600 ? error.statusCode : 500
      try {
        const errorData = JSON.parse(error.body)
        res.status(statusCode).json(errorData)
      } catch {
        res.status(statusCode).json({ error: error.message })
      }
      return
    }

    if (error instanceof Error) {
      logError(error, { context: 'admin-update-mentor-status', method: req.method, url: req.url })
    }
    res.status(500).json({ error: 'Internal server error' })
  }
}

export default withObservability(handler)
