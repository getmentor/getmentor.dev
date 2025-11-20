/**
 * HTTP client for Go API backend
 * Handles authentication, retries, error handling for calls to the Go API
 */

class GoApiClient {
  constructor(baseURL, internalToken) {
    this.baseURL = baseURL
    this.internalToken = internalToken
    this.timeout = 30000 // 30 seconds
  }

  /**
   * Make an HTTP request to the Go API
   * @param {string} method - HTTP method (GET, POST, etc.)
   * @param {string} path - API path (e.g., /api/mentors)
   * @param {object} options - Request options
   * @returns {Promise<any>} Response data
   */
  async request(method, path, options = {}) {
    const url = `${this.baseURL}${path}`
    const headers = {
      'Content-Type': 'application/json',
      'x-internal-mentors-api-auth-token': this.internalToken,
      ...options.headers,
    }

    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), this.timeout)

      const response = await fetch(url, {
        method,
        headers,
        body: options.body ? JSON.stringify(options.body) : undefined,
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Go API error: ${response.status} ${response.statusText} - ${errorText}`)
      }

      return await response.json()
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error(`Go API request timeout after ${this.timeout}ms: ${path}`)
      }
      throw error
    }
  }

  /**
   * Get all mentors
   * @param {object} params - Query parameters
   * @param {boolean} params.onlyVisible - Only return visible mentors
   * @param {boolean} params.drop_long_fields - Drop long text fields
   * @returns {Promise<Array>} Array of mentors
   */
  async getAllMentors(params = {}) {
    return this.request('POST', '/api/internal/mentors', {
      body: {
        only_visible: params.onlyVisible,
        drop_long_fields: params.drop_long_fields,
      },
    })
  }

  /**
   * Get a single mentor by slug
   * @param {string} slug - Mentor slug
   * @param {object} params - Query parameters
   * @param {boolean} params.showHiddenFields - Include hidden fields
   * @returns {Promise<object|null>} Mentor object or null if not found
   */
  async getOneMentorBySlug(slug, params = {}) {
    try {
      return await this.request('POST', `/api/internal/mentors?slug=${slug}`, {
        body: {
          show_hidden: params.showHiddenFields,
        },
      })
    } catch (error) {
      // Return null for 404 (mentor not found) - this is expected behavior
      if (error.message && error.message.includes('404')) {
        return null
      }
      // Re-throw other errors
      throw error
    }
  }

  /**
   * Get a single mentor by ID
   * @param {number} id - Mentor ID
   * @param {object} params - Query parameters
   * @param {boolean} params.showHiddenFields - Include hidden fields
   * @returns {Promise<object|null>} Mentor object or null if not found
   */
  async getOneMentorById(id, params = {}) {
    try {
      return await this.request('POST', `/api/internal/mentors?id=${id}`, {
        body: {
          show_hidden: params.showHiddenFields,
        },
      })
    } catch (error) {
      // Return null for 404 (mentor not found) - this is expected behavior
      if (error.message && error.message.includes('404')) {
        return null
      }
      // Re-throw other errors
      throw error
    }
  }

  /**
   * Get a single mentor by Airtable record ID
   * @param {string} rec - Airtable record ID
   * @param {object} params - Query parameters
   * @param {boolean} params.showHiddenFields - Include hidden fields
   * @returns {Promise<object>} Mentor object
   */
  async getOneMentorByRecordId(rec, params = {}) {
    return this.request('POST', `/api/internal/mentors?rec=${rec}`, {
      body: {
        show_hidden: params.showHiddenFields,
      },
    })
  }

  /**
   * Save mentor profile
   * @param {string} mentorId - Mentor ID
   * @param {string} authToken - Auth token
   * @param {object} profileData - Profile data to save
   * @returns {Promise<object>} Response
   */
  async saveProfile(mentorId, authToken, profileData) {
    return this.request('POST', '/api/save-profile', {
      headers: {
        'X-Mentor-ID': mentorId,
        'X-Auth-Token': authToken,
      },
      body: profileData,
    })
  }

  /**
   * Upload profile picture
   * @param {string} mentorId - Mentor ID
   * @param {string} authToken - Auth token
   * @param {object} imageData - Image data (base64)
   * @returns {Promise<object>} Response
   */
  async uploadProfilePicture(mentorId, authToken, imageData) {
    return this.request('POST', '/api/upload-profile-picture', {
      headers: {
        'X-Mentor-ID': mentorId,
        'X-Auth-Token': authToken,
      },
      body: imageData,
    })
  }

  /**
   * Contact a mentor
   * @param {object} contactData - Contact form data
   * @returns {Promise<object>} Response
   */
  async contactMentor(contactData) {
    return this.request('POST', '/api/contact-mentor', {
      body: contactData,
    })
  }
}

// Singleton instance
let clientInstance = null

/**
 * Get or create the Go API client singleton
 * @returns {GoApiClient} Client instance
 */
export function getGoApiClient() {
  if (!clientInstance) {
    const baseURL = process.env.NEXT_PUBLIC_GO_API_URL || 'http://localhost:8081'
    const token = process.env.GO_API_INTERNAL_TOKEN || ''

    if (!token) {
      console.warn('GO_API_INTERNAL_TOKEN not set, API calls may fail')
    }

    clientInstance = new GoApiClient(baseURL, token)
  }
  return clientInstance
}

export default GoApiClient
