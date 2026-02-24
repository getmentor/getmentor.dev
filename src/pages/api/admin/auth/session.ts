import type { NextApiRequest, NextApiResponse } from 'next'
import { getGoApiClient, HttpError } from '@/lib/go-api-client'
import { logError } from '@/lib/logger'
import { withObservability } from '@/lib/with-observability'

async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const cookies = req.headers.cookie
  if (!cookies) {
    res.status(401).json({ success: false, error: 'Unauthorized' })
    return
  }

  try {
    const client = getGoApiClient()
    const { data } = await client.adminGetSession(cookies)
    res.status(200).json(data)
  } catch (error) {
    if (error instanceof HttpError) {
      const status = error.statusCode >= 400 && error.statusCode < 600 ? error.statusCode : 500
      try {
        const errorData = JSON.parse(error.body)
        res.status(status).json(errorData)
      } catch {
        res.status(status).json({ success: false, error: error.message })
      }
      return
    }

    if (error instanceof Error) {
      logError(error, { context: 'admin-session', method: req.method, url: req.url })
    }
    res.status(500).json({ success: false, error: 'Internal server error' })
  }
}

export default withObservability(handler)
