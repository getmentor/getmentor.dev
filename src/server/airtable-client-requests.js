import { airtableBase } from './airtable-base'

/**
 * @typedef ClientRequest
 * @param {string} Email
 * @param {string} Name
 * @param {string} Level
 * @param {string} Mentor
 * @param {string} Description
 * @param {string} Telegram
 */

/**
 * @param {ClientRequest} request
 * @returns {Promise<Record>}
 */

const TEST = process.env.NEXT_PUBLIC_TESTING_MODE
export async function createClientRequest(request) {
  if (TEST === 'on') {
    return null
  }
  return airtableBase('Client Requests').create(request)
}
