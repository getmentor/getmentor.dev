import type { NextApiRequest, NextApiResponse } from 'next'
import { getGoApiClient } from '@/lib/go-api-client'
import { getSingleQueryParam, sendAdminProxyError } from '@/lib/admin-api-proxy'
import { withObservability } from '@/lib/with-observability'
import type { MentorDeleteRequest } from '@/types'

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

  const mentorId = getSingleQueryParam(req.query.id)
  if (!mentorId) {
    res.status(400).json({ error: 'Invalid mentor ID' })
    return
  }

  const body = req.body as Partial<MentorDeleteRequest> | undefined
  if (!body || typeof body.slug !== 'string' || body.slug.trim() === '') {
    res.status(400).json({ error: 'Slug is required' })
    return
  }

  try {
    const client = getGoApiClient()
    const mentor = await client.adminDeleteMentor(cookies, mentorId, { slug: body.slug.trim() })
    res.status(200).json({ mentor })
  } catch (error) {
    sendAdminProxyError(req, res, error, 'admin-delete-mentor')
  }
}

export default withObservability(handler)
