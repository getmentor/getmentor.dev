import { getMentors as getMentorsFromAirtable } from './airtable-mentors'

const hash = require('object-hash');

/**
 * @var {Promise<Mentor[]>}
 */
let mentorsPromise

/**
 * @var {Mentor[]}
 */
let mentors

// warm up cache on start
mentorsPromise = getMentorsFromAirtable()

// rebuild cache every 5 minutes
setInterval(async () => {
  try {
    let new_mentors = await getMentorsFromAirtable()
    let new_hash = hash(new_mentors)
    let old_hash = mentors ? hash(mentors) : '__'

    if (new_hash !== old_hash) {
      mentors = new_mentors
    }
  } catch (e) {
    console.error(e)
  }
}, 10 * 60 * 1000)

/**
 * @returns {Promise<Mentor[]>}
 */
export async function getMentors() {
  if (!mentors) {
    if (!mentorsPromise) {
      mentorsPromise = getMentorsFromAirtable()
    }

    mentors = await mentorsPromise
    return mentors
  }

  return mentors
}
