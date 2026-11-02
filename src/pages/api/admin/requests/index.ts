import type { NextApiRequest, NextApiResponse } from 'next'
import { getGoApiClient } from '@/lib/go-api-client'
import { getSingleQueryParam, sendAdminProxyError } from '@/lib/admin-api-proxy'
import { withObservability } from '@/lib/with-observability'
import { ADMIN_REQUESTS_QUERY_KEYS } from '@/types'
import type { AdminRequestsQuery } from '@/types'

async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const cookies = req.headers.cookie
  if (!cookies) {
    res.status(401).json({ error: 'Unauthorized' })
    return
  }

  // Forward only known filter/pagination params; the Go API validates values.
  const query: Record<string, string> = {}
  for (const key of ADMIN_REQUESTS_QUERY_KEYS) {
    const value = getSingleQueryParam(req.query[key])
    if (value) query[key] = value
  }

  try {
    const client = getGoApiClient()
    const data = await client.adminListRequests(cookies, query as AdminRequestsQuery)
    res.status(200).json(data)
  } catch (error) {
    sendAdminProxyError(req, res, error, 'admin-list-requests')
  }
}

export default withObservability(handler)
