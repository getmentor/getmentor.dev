import type { NextApiRequest, NextApiResponse } from 'next'
import { getGoApiClient } from '@/lib/go-api-client'
import { sendAdminProxyError } from '@/lib/admin-api-proxy'
import { withObservability } from '@/lib/with-observability'
import type { MentorDeleteRequest } from '@/types'

/**
 * POST /api/mentor/profile/delete
 * Soft-deletes the authenticated mentor's profile. Body: { slug } to confirm.
 * Forwards the Set-Cookie header that clears the session.
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

  const body = req.body as Partial<MentorDeleteRequest> | undefined
  if (!body || typeof body.slug !== 'string' || body.slug.trim() === '') {
    res.status(400).json({ error: 'Slug is required' })
    return
  }

  try {
    const client = getGoApiClient()
    const { data, headers } = await client.mentorDeleteProfile(cookies, { slug: body.slug.trim() })

    const setCookie = headers.get('set-cookie')
    if (setCookie) {
      res.setHeader('Set-Cookie', setCookie)
    }

    res.status(200).json(data)
  } catch (error) {
    sendAdminProxyError(req, res, error, 'mentor-delete-profile')
  }
}

export default withObservability(handler)
