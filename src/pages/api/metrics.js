import register from '../../lib/metrics'

const handler = async (req, res) => {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // SECURITY: Require authentication token
  // Metrics should only be accessible from Grafana Alloy, not public internet
  // Accept token from either x-metrics-auth-token header or Authorization header
  const customHeader = req.headers['x-metrics-auth-token']
  const authHeader = req.headers['authorization']
  let authToken = customHeader

  // If no custom header, try to extract from Authorization header (Bearer token)
  if (!authToken && authHeader && authHeader.startsWith('Bearer ')) {
    authToken = authHeader.substring(7) // Remove 'Bearer ' prefix
  }

  const expectedToken = process.env.METRICS_AUTH_TOKEN

  if (!authToken) {
    return res.status(401).json({ error: 'Missing authentication token' })
  }

  if (!expectedToken) {
    console.error('[METRICS ERROR] METRICS_AUTH_TOKEN environment variable not set')
    return res.status(500).json({ error: 'Server misconfigured' })
  }

  // Constant-time comparison to prevent timing attacks
  if (authToken !== expectedToken) {
    return res.status(403).json({ error: 'Invalid authentication token' })
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
