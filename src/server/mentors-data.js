import fetch from 'node-fetch'
import constants from '../config/constants'

export async function getAllMentors(params) {
  return makeApiCall('api/internal/mentors', params)
}

export async function getOneMentorBySlug(slug, params) {
  return makeApiCall('api/internal/mentors/by_slug/' + slug, params)
}

export async function getOneMentorById(id, params) {
  return makeApiCall('api/internal/mentors/by_id/' + id, params)
}

export async function getOneMentorByRecordId(rec, params) {
  return makeApiCall('api/internal/mentors/by_rec/' + rec, params)
}

export async function forceRefreshCache() {
  return makeApiCall('api/internal/force_reset_cache')
}

async function makeApiCall(path, params) {
  return fetch(constants.BASE_URL + path, {
    method: 'POST',
    body: JSON.stringify({
      show_hidden: params?.showHiddenFields,
      only_visible: params?.onlyVisible,
      force_refresh: params?.forceRefresh,
    }),
    headers: {
      'X-INTERNAL-MENTORS-API-AUTH-TOKEN': process.env.INTERTNAL_MENTORS_API,
      'Content-Type': 'application/json',
    },
  }).then((r) => r.json())
}
