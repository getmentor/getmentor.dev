import { getMentors as getMentorsFromAirtable } from './airtable-mentors'

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
    mentors = await getMentorsFromAirtable()
  } catch (e) {
    console.error(e)
  }
}, 5 * 60 * 1000)

/**
 * @returns {Promise<Mentor[]>}
 */
export async function getMentors() {
  if (!mentors) {
    if (!mentorsPromise) {
      mentorsPromise = getMentorsFromAirtable()
    }

    return await mentorsPromise
  }

  return mentors
}
