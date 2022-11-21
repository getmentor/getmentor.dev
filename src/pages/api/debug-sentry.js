import { withSentry } from '@sentry/nextjs'

const handler = (req, res) => {
  throw 'New sample Sentry error'
}

export default withSentry(handler)
