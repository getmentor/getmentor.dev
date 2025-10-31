import register from '../../lib/metrics'

const handler = async (req, res) => {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
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
