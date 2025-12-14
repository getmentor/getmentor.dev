import type { NextApiRequest, NextApiResponse } from 'next'
import { getGoApiClient } from '@/lib/go-api-client'
import { logError } from '@/lib/logger'
import { withObservability } from '@/lib/with-observability'
import type { RegisterMentorRequest } from '@/types/api'

/**
 * SECURITY: Next.js API proxy for register-mentor endpoint
 * This allows Go API to remain on localhost only (not publicly exposed)
 * Client -> Next.js API Route (this file) -> Go API (localhost)
 */
async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  try {
    // Use Go API client to forward request
    const client = getGoApiClient()
    const data = await client.registerMentor(req.body as RegisterMentorRequest)

    res.status(200).json(data)
  } catch (error) {
    if (error instanceof Error) {
      logError(error, { context: 'register-mentor-proxy', method: req.method, url: req.url })
    }
    res.status(500).json({ error: 'Internal server error' })
  }
}

export default withObservability(handler)

// Increase body size limit to 10MB to accommodate profile picture uploads
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
}
