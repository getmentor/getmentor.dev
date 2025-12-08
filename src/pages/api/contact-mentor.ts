import type { NextApiRequest, NextApiResponse } from 'next'
import { getGoApiClient } from '@/lib/go-api-client'
import { logError } from '@/lib/logger'
import { withObservability } from '@/lib/with-observability'
import type { ContactMentorRequest } from '@/types'

/**
 * SECURITY: Next.js API proxy for contact-mentor endpoint
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
    const data = await client.contactMentor(req.body as ContactMentorRequest)

    res.status(200).json(data)
  } catch (error) {
    if (error instanceof Error) {
      logError(error, { context: 'contact-mentor-proxy', method: req.method, url: req.url })
    }
    res.status(500).json({ error: 'Internal server error' })
  }
}

export default withObservability(handler)
