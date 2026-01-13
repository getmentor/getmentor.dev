import type { NextApiRequest, NextApiResponse } from 'next'
import { getGoApiClient, HttpError } from '@/lib/go-api-client'
import { logError } from '@/lib/logger'
import { withObservability } from '@/lib/with-observability'

/**
 * POST /api/mentor/auth/logout
 * Clear mentor session cookie
 */
async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  try {
    const client = getGoApiClient()
    const cookies = req.headers.cookie || ''
    const { data, headers } = await client.mentorLogout(cookies)

    // Forward Set-Cookie header (to clear the cookie)
    const setCookie = headers.get('set-cookie')
    if (setCookie) {
      res.setHeader('Set-Cookie', setCookie)
    }

    res.status(200).json(data)
  } catch (error) {
    if (error instanceof HttpError) {
      const status = error.statusCode >= 400 && error.statusCode < 600 ? error.statusCode : 500
      try {
        const errorData = JSON.parse(error.body)
        res.status(status).json(errorData)
      } catch {
        res.status(status).json({ success: false, message: error.message })
      }
      return
    }

    if (error instanceof Error) {
      logError(error, { context: 'mentor-logout', method: req.method, url: req.url })
    }
    res.status(500).json({ success: false, message: 'Internal server error' })
  }
}

export default withObservability(handler)
