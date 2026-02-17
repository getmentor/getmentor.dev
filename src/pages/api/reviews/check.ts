import type { NextApiRequest, NextApiResponse } from 'next'
import { getGoApiClient } from '@/lib/go-api-client'
import { logError } from '@/lib/logger'
import { withObservability } from '@/lib/with-observability'

interface ReviewCheckResponse {
  canSubmit: boolean
  error?: string
  mentorName?: string
}

interface ErrorResponse {
  error: string
}

/**
 * API route to check if a review can be submitted for a request
 * Proxies GET /api/v1/reviews/{requestId}/check from Go API
 */
async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ReviewCheckResponse | ErrorResponse>
): Promise<void> {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  try {
    const requestId = req.query.request_id as string

    if (!requestId || typeof requestId !== 'string') {
      res.status(400).json({ error: 'Invalid request ID' })
      return
    }

    const client = getGoApiClient()
    const result = await client.request<ReviewCheckResponse>(
      'GET',
      `/api/v1/reviews/${encodeURIComponent(requestId)}/check`
    )

    res.status(200).json(result)
  } catch (error) {
    if (error instanceof Error) {
      logError(error, { context: 'check-review-proxy', method: req.method, url: req.url })
    }
    res.status(500).json({ error: 'Internal server error' })
  }
}

export default withObservability(handler)
