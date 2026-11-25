import type { NextApiRequest, NextApiResponse } from 'next'
import { getGoApiClient } from '@/lib/go-api-client'
import { sendMenteeProxyError } from '@/lib/mentee-api-proxy'
import { withObservability } from '@/lib/with-observability'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/**
 * POST /api/mentee/reviews
 * Leave a review on one of the mentee's done requests. The logged-in session authorizes it.
 * The request id travels only in the JSON body (it is a capability for legacy review links).
 * Limits match /api/reviews/submit.
 */
async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const cookies = req.headers.cookie
  if (!cookies) {
    res.status(401).json({ success: false, error: 'Unauthorized' })
    return
  }

  const { requestId, mentorReview, platformReview, improvements, recaptchaToken } = (req.body ||
    {}) as Record<string, unknown>

  if (typeof requestId !== 'string' || !UUID_RE.test(requestId)) {
    res.status(400).json({ success: false, error: 'Invalid request' })
    return
  }
  if (typeof mentorReview !== 'string' || mentorReview.trim().length < 10) {
    res.status(400).json({ success: false, error: 'Отзыв должен быть не короче 10 символов' })
    return
  }
  for (const value of [mentorReview, platformReview, improvements]) {
    if (value !== undefined && (typeof value !== 'string' || value.length > 5000)) {
      res.status(400).json({ success: false, error: 'Превышен лимит символов (не более 5000)' })
      return
    }
  }
  if (typeof recaptchaToken !== 'string' || !recaptchaToken) {
    res.status(400).json({ success: false, error: 'Captcha token is required' })
    return
  }

  try {
    const data = await getGoApiClient().menteeSubmitReview(cookies, {
      requestId,
      mentorReview: mentorReview.trim(),
      platformReview: typeof platformReview === 'string' ? platformReview.trim() : '',
      improvements: typeof improvements === 'string' ? improvements.trim() : '',
      recaptchaToken,
    })
    res.status(200).json(data)
  } catch (error) {
    sendMenteeProxyError(req, res, error, 'mentee-review')
  }
}

export default withObservability(handler)
