import crypto from 'crypto'
import type { NextApiRequest, NextApiResponse } from 'next'
import register from '@/lib/metrics'

async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  // Only allow GET requests
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  // SECURITY: Require authentication token
  // Metrics should only be accessible from Grafana Alloy, not public internet
  // Accept token from either x-metrics-auth-token header or Authorization header
  const customHeader = req.headers['x-metrics-auth-token']
  const authHeader = req.headers['authorization']
  let authToken = Array.isArray(customHeader) ? customHeader[0] : customHeader

  // If no custom header, try to extract from Authorization header (Bearer token)
  if (!authToken && authHeader) {
    const headerValue = Array.isArray(authHeader) ? authHeader[0] : authHeader
    if (headerValue.startsWith('Bearer ')) {
      authToken = headerValue.substring(7) // Remove 'Bearer ' prefix
    }
  }

  const expectedToken = process.env.METRICS_AUTH_TOKEN

  if (!authToken) {
    res.status(401).json({ error: 'Missing authentication token' })
    return
  }

  if (!expectedToken) {
    console.error('[METRICS ERROR] METRICS_AUTH_TOKEN environment variable not set')
    res.status(500).json({ error: 'Server misconfigured' })
    return
  }

  // Constant-time comparison to prevent timing attacks
  const a = Buffer.from(authToken)
  const b = Buffer.from(expectedToken)
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    res.status(403).json({ error: 'Invalid authentication token' })
    return
  }

  try {
    // Set the content type to Prometheus text format
    res.setHeader('Content-Type', register.contentType)

    // Get all metrics
    const metrics = await register.metrics()

    res.status(200).send(metrics)
  } catch (error) {
    console.error('[METRICS ERROR]', error)
    res.status(500).json({ error: 'Failed to collect metrics' })
  }
}

export default handler
