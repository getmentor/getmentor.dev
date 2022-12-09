import { AUTH_TOKEN, CALENDAR_URL } from '../lib/entities'
import { getMentors as getMentorsFromData } from '../server/airtable-mentors'

const NodeCache = require('node-cache')
const mentorsCache = new NodeCache({
  stdTTL: 60,
  checkperiod: 10,
  useClones: false,
  deleteOnExpire: false,
})
mentorsCache.on('expired', refresh)

async function refresh(key, value) {
  const mentors = await getMentorsFromData(true)
  mentorsCache.del('main')
  mentorsCache.set('main', mentors)
  return mentors
}
