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
export async function createClientRequest(request) {
  return airtableBase('Client Requests').create(request)
}
