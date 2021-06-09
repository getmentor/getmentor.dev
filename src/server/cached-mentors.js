import NodeCache from 'node-cache'
import { getMentors as getMentorsFromAirtable } from './airtable-mentors'

const cache = new NodeCache({
  stdTTL: 5 * 60, // set default ttl to 5 minutes
})

/**
 * @returns {Promise<Mentor[]>}
 */
export async function getMentors() {
  let mentors = cache.get('mentors')
  if (!mentors) {
    mentors = await getMentorsFromAirtable()
    cache.set('mentors', mentors)
  }

  return mentors
}
