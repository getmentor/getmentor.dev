/**
 * @typedef Mentor
 * @property {number} id
 * @property {string} airtableId
 * @property {string} slug
 * @property {string} name
 * @property {string} job
 * @property {string} workplace
 * @property {string} description
 * @property {string} experience
 * @property {string} price
 * @property {number} menteeCount
 * @property {Object} photo
 * @property {string} photo_url
 * @property {string[]} tags
 * @property {number} sortOrder
 * @property {boolean} isVisible
 */

export const AUTH_TOKEN = Symbol('authToken')
export const CALENDAR_URL = Symbol('calendar_url')
