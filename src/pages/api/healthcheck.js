import { withSentry } from '@sentry/nextjs'

const handler = (req, res) => {
  res.setHeader('Cache-Control', 'no-cache, no-store, max-age=0, must-revalidate')
  res.status(200).json({})
}

export default withSentry(handler)
