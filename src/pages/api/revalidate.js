import { withObservability } from '../../lib/with-observability'
import logger from '../../lib/logger'

const handler = async function handler(req, res) {
  // Check for secret to confirm this is a valid request
  if (req.query.secret !== process.env.REVALIDATE_SECRET_TOKEN) {
    return res.status(401).json({ message: 'Invalid token' })
  }

  try {
    const slug = req.query.slug

    await Promise.all([
      res.revalidate('/'),
      res.revalidate('/ontico'),
      res.revalidate(`/mentor/${slug}`),
      res.revalidate(`/mentor/${slug}/contact`),
    ])

    logger.info('Pages revalidated', { slug })
    return res.json({ revalidated: true })
  } catch (err) {
    logger.error('Error revalidating pages', { slug: req.query.slug, error: err.message })
    return res.status(500).send('Error revalidating: ' + err)
  }
}

export default withObservability(handler)
