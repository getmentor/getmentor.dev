import Airtable from 'airtable'

const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(
  process.env.AIRTABLE_BASE_ID
)

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
  return base('Client Requests').create(request)
}
