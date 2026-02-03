import type { NextApiRequest, NextApiResponse } from 'next'
import { getGoApiClient } from '@/lib/go-api-client'
import { logError } from '@/lib/logger'
import { withObservability } from '@/lib/with-observability'

interface SubmitReviewRequest {
  requestId: string
  review: string
}

interface SubmitReviewResponse {
  success: boolean
  message?: string
}

interface ErrorResponse {
  error: string
  message?: string
}

/**
 * API route to submit mentee review for a request
 * Proxies to Go API backend
 */
async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SubmitReviewResponse | ErrorResponse>
): Promise<void> {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  try {
    const { requestId, review } = req.body as SubmitReviewRequest

    // Validation
    if (!requestId || typeof requestId !== 'string') {
      res.status(400).json({ error: 'Invalid request ID' })
      return
    }

    if (!review || typeof review !== 'string' || !review.trim()) {
      res.status(400).json({ error: 'Review text is required' })
      return
    }

    if (review.length > 5000) {
      res.status(400).json({ error: 'Review text is too long (max 5000 characters)' })
      return
    }

    // Forward to Go API
    const client = getGoApiClient()
    const result = await client.request<SubmitReviewResponse>(
      'POST',
      `/api/v1/reviews/${encodeURIComponent(requestId)}`,
      {
        body: { review: review.trim() },
      }
    )

    res.status(200).json(result)
  } catch (error) {
    if (error instanceof Error) {
      logError(error, { context: 'submit-review-proxy', method: req.method, url: req.url })
    }
    res.status(500).json({ error: 'Internal server error', message: 'Failed to submit review' })
  }
}

export default withObservability(handler)
