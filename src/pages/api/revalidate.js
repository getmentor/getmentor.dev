let a = require('../../lib/load-appinsights')

export default async function handler(req, res) {
  // Check for secret to confirm this is a valid request
  if (req.query.secret !== process.env.REVALIDATE_SECRET_TOKEN) {
    return res.status(401).json({ message: 'Invalid token' })
  }

  try {
    const slug = req.query.slug
    const baseUrl = process.env.GETMENTOR_DOMAIN

    await Promise.all([
      res.revalidate('/'),
      res.revalidate('/ontico'),
      res.revalidate(`/mentor/${slug}`),
      res.revalidate(`/mentor/${slug}/contact`),
    ])

    return res.json({ revalidated: true })
  } catch (err) {
    return res.status(500).send('Error revalidating')
  }
}