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

refresh()

// Initialize the cors middleware
const cors = initMiddleware(
  // You can read more about the available options here: https://github.com/expressjs/cors#configuration-options
  Cors({
    // Only allow requests with GET and OPTIONS
    methods: ['GET', 'OPTIONS'],
  })
)

const handler = async (req, res) => {
  await cors(req, res)

  // Only allow GET
  if (req.method !== 'GET') {
    return res.status(403).json({})
  }

  // Only allow authenticated requests
  if (req.headers?.internal_mentors_api_auth_token !== process.env.INTERTNAL_MENTORS_API) {
    return res.status(403).json({})
  }

  let result = mentorsCache.get('main')
  if (result == undefined) {
    result = await refresh()
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
    result = result.filter((m) => m.id == req.query.id)
    result = result.length === 1 ? result[0] : undefined
  } else if (req.query?.slug) {
    result = result.filter((m) => m.slug == req.query.slug)
    result = result.length === 1 ? result[0] : undefined
  }

  return res.status(200).json({ result })
}

export default Sentry.withSentry(handler)

async function refresh(key, value) {
  let mentors = await getMentors(true)
  mentorsCache.set('main', mentors)
  return mentors
}
