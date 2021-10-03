import hash from 'object-hash'
import { getMentors as getMentorsFromAirtable } from './airtable-mentors'
import { CALENDAR_URL } from '../lib/entities'

/**
 * @var {Promise<Mentor[]>}
 */
let initPromise

/**
 * @var {Mentor[]}
 */
let mentors

/**
 * @var {string}
 */
let mentorsHash

/**
 * @var {number}
 */
let mentorsLoadedAt

// this hack prevent this functions to me called during build time and etc
// be sure you set APP_ENV in production deployment
if (process.env.APP_ENV === 'production') {
  init()
}

/**
 * @returns {void}
 */
function init() {
  // warm up cache on start
  getMentors().catch(console.error)

  // fetch new data periodically
  setInterval(() => {
    loadMentorsToCache().catch(console.error)
  }, 10 * 60 * 1000)
}

/**
 * @returns {Promise<void>}
 */
async function loadMentorsToCache() {
  const newMentors = await getMentorsFromAirtable()
  const newHash = hash(newMentors)
  if (newHash !== mentorsHash) {
    mentors = newMentors
    mentorsHash = newHash
  }
  mentorsLoadedAt = Date.now()
}

/**
 * @returns {Promise<Mentor[]>}
 */
export async function getMentors() {
  // uncomment if you want to disable cache
  // return getMentorsFromAirtable()

  if (!mentors) {
    // this logic allows to avoid race conditions on app start
    // - first request? remember promise to `initPromise`
    // - another one? wait for `initPromise` to be resolved
    if (!initPromise) {
      initPromise = loadMentorsToCache()
    }
    await initPromise
  }

  // extra safety if setInterval logic fails or APP_ENV not added
  if (!mentorsLoadedAt || Date.now() - mentorsLoadedAt >= 60 * 60 * 1000) {
    await loadMentorsToCache()
  }

  return mentors
}

/**
 * @param {string} recordId
 * @param {Mentor} newProps
 * @returns {Mentor|null}
 */
export function updateMentor(recordId, newProps) {
  const oldMentor = mentors.find((mentor) => mentor.airtableId === recordId)
  if (!oldMentor) {
    return null
  }

  for (const key in newProps) {
    oldMentor[key] = newProps[key]
  }

  // Update calendar link in SYMBOL
  oldMentor[CALENDAR_URL] = newProps.calendarUrl

  return oldMentor
}

/**
 * @returns {Promise<Mentor[]>}
 */
export async function forceResetCache() {
  await loadMentorsToCache()
  return mentors
}
