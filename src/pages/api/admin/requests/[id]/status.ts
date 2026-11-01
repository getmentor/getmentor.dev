import type { NextApiRequest, NextApiResponse } from 'next'
import { getGoApiClient } from '@/lib/go-api-client'
import { getSingleQueryParam, sendAdminProxyError } from '@/lib/admin-api-proxy'
import { withObservability } from '@/lib/with-observability'
import { ADMIN_REQUEST_STATUSES } from '@/types'
import type { AdminRequestStatusUpdateRequest } from '@/types'

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

  const requestId = getSingleQueryParam(req.query.id)
  if (!requestId) {
    res.status(400).json({ error: 'Invalid request ID' })
    return
  }

  const body = req.body as AdminRequestStatusUpdateRequest | undefined
  if (!body || !ADMIN_REQUEST_STATUSES.includes(body.status)) {
    res.status(400).json({ error: 'Invalid status' })
    return
  }

  try {
    const client = getGoApiClient()
    const request = await client.adminUpdateRequestStatus(cookies, requestId, {
      status: body.status,
    })
    res.status(200).json({ request })
  } catch (error) {
    sendAdminProxyError(req, res, error, 'admin-update-request-status')
  }
}

export default withObservability(handler)
