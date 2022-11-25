import * as Sentry from '@sentry/nextjs'
import Cors from 'cors'
import initMiddleware from '../../../lib/init-middleware'
import { AUTH_TOKEN, CALENDAR_URL } from '../../../lib/entities'

import { getMentors } from '../../../server/airtable-mentors'

const NodeCache = require('node-cache')
const mentorsCache = new NodeCache({
  stdTTL: 60,
  checkperiod: 10,
  useClones: false,
  deleteOnExpire: false,
})
mentorsCache.on('del', refresh)
mentorsCache.on('expired', refresh)

refresh()

// Initialize the cors middleware
const cors = initMiddleware(
  // You can read more about the available options here: https://github.com/expressjs/cors#configuration-options
  Cors({
    // Only allow requests with POST and OPTIONS
    methods: ['GET', 'POST', 'OPTIONS'],
  })
)

const handler = async (req, res) => {
  await cors(req, res)

  // Only allow GET
  if (req.method !== 'POST') {
    return res.status(403).json({})
  }

  // Only allow authenticated requests
  if (req.headers['x-internal-mentors-api-auth-token'] !== process.env.INTERTNAL_MENTORS_API) {
    return res.status(403).json({})
  }

  if (req.query?.force_reset_cache) {
    await refresh()
    return res.status(200).json({ success: true })
  }

  let result = mentorsCache.get('main')
  if (result == undefined) {
    result = await refresh()
  }

  if (req.body?.only_visible) {
    result = result.filter((m) => m.isVisible)
  }

  if (req.body?.show_hidden) {
    result = result.map((m) => {
      return {
        ...m,
        authToken: m[AUTH_TOKEN],
        calendarUrl: m[CALENDAR_URL],
      }
    })
  }

  if (req.query?.id) {
    const id = parseInt(req.query.id, 10)
    result = result.filter((m) => m.id === id)
    result = result.length === 1 ? result[0] : undefined
  } else if (req.query?.slug) {
    result = result.filter((m) => m.slug === req.query.slug)
    result = result.length === 1 ? result[0] : undefined
  } else if (req.query?.rec) {
    result = result.filter((m) => m.airtableId === req.query.rec)
    result = result.length === 1 ? result[0] : undefined
  }

  return res.status(200).json(result)
}

export default Sentry.withSentry(handler)

async function refresh(key, value) {
  let mentors = await getMentors(true)
  mentorsCache.set('main', mentors)
  return mentors
}
