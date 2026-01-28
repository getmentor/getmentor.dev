import type { NextApiRequest, NextApiResponse } from 'next'
import { getGoApiClient, HttpError } from '@/lib/go-api-client'
import { logError } from '@/lib/logger'
import { withObservability } from '@/lib/with-observability'
import type { RequestStatus } from '@/types'

const VALID_STATUSES: RequestStatus[] = [
  'pending',
  'contacted',
  'working',
  'done',
  'declined',
  'unavailable',
]

/**
 * POST /api/mentor/requests/[id]/status
 * Update request status
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

  const { id } = req.query
  if (!id || typeof id !== 'string') {
    res.status(400).json({ error: 'Invalid request ID' })
    return
  }

  const { status } = req.body
  if (!status || !VALID_STATUSES.includes(status)) {
    res.status(400).json({ error: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}` })
    return
  }

  try {
    const client = getGoApiClient()
    const data = await client.mentorUpdateRequestStatus(cookies, id, status)
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
      logError(error, { context: 'mentor-update-status', method: req.method, url: req.url })
    }
    res.status(500).json({ error: 'Internal server error' })
  }
}

export default withObservability(handler)
