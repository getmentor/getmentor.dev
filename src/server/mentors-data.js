/**
 * Data access layer for mentor data
 * Now uses Go API backend instead of direct Airtable access
 */

import { getGoApiClient } from '../lib/go-api-client'

const client = getGoApiClient()

/**
 * Get all mentors from the Go API
 * @param {object} params - Query parameters
 * @param {boolean} params.onlyVisible - Only return visible mentors
 * @param {boolean} params.drop_long_fields - Drop long text fields
 * @returns {Promise<Array>} Array of mentors
 */
export async function getAllMentors(params = {}) {
  return client.getAllMentors(params)
}

/**
 * Get a single mentor by slug
 * @param {string} slug - Mentor slug
 * @param {object} params - Query parameters
 * @param {boolean} params.showHiddenFields - Include hidden fields (e.g., auth token, calendar URL)
 * @returns {Promise<object>} Mentor object
 */
export async function getOneMentorBySlug(slug, params = {}) {
  const result = await client.getOneMentorBySlug(slug, params)
  // Go API returns single object, not array
  return result
}

/**
 * Get a single mentor by ID
 * @param {number} id - Mentor ID
 * @param {object} params - Query parameters
 * @param {boolean} params.showHiddenFields - Include hidden fields
 * @returns {Promise<object>} Mentor object
 */
export async function getOneMentorById(id, params = {}) {
  const result = await client.getOneMentorById(id, params)
  // Go API returns single object, not array
  return result
}

/**
 * Get a single mentor by Airtable record ID
 * @param {string} rec - Airtable record ID (e.g., "recXXXXXXXXXXXXXX")
 * @param {object} params - Query parameters
 * @param {boolean} params.showHiddenFields - Include hidden fields
 * @returns {Promise<object>} Mentor object
 */
export async function getOneMentorByRecordId(rec, params = {}) {
  const result = await client.getOneMentorByRecordId(rec, params)
  // Go API returns single object, not array
  return result
}

/**
 * Force refresh the cache in Go API
 * This triggers a cache reset on the Go API side
 * @returns {Promise<object>} Response from Go API
 */
export async function forceRefreshCache() {
  return client.forceRefreshCache()
}
