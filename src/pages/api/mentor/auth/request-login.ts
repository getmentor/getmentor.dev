import type { NextApiRequest, NextApiResponse } from 'next'
import { getGoApiClient, HttpError } from '@/lib/go-api-client'
import { logError } from '@/lib/logger'
import { withObservability } from '@/lib/with-observability'

/**
 * POST /api/mentor/auth/request-login
 * Request a magic link to be sent to mentor's email
 */
async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const { email } = req.body

  if (!email || typeof email !== 'string') {
    res.status(400).json({ success: false, message: 'Email is required' })
    return
  }

  // Generic success response to prevent email enumeration attacks
  const genericSuccessResponse = {
    success: true,
    message: 'Если ваш email зарегистрирован в системе, вы получите ссылку для входа',
  }

  try {
    const client = getGoApiClient()
    await client.mentorRequestLogin(email)
    // Always return generic success message
    res.status(200).json(genericSuccessResponse)
  } catch (error) {
    if (error instanceof HttpError) {
      // Log the actual error for debugging
      logError(new Error(`Request login failed: ${error.statusCode} ${error.body}`), {
        context: 'mentor-request-login',
        email,
        statusCode: error.statusCode,
      })

      // For 4xx errors (not found, forbidden, etc.), return 200 with generic message
      // to prevent email enumeration attacks
      if (error.statusCode >= 400 && error.statusCode < 500) {
        res.status(200).json(genericSuccessResponse)
        return
      }

      // Only expose 5xx as actual errors
      res.status(500).json({ success: false, message: 'Internal server error' })
      return
    }

    if (error instanceof Error) {
      logError(error, { context: 'mentor-request-login', method: req.method, url: req.url })
    }
    res.status(500).json({ success: false, message: 'Internal server error' })
  }
}

export default withObservability(handler)
