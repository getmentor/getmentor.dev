import fetch from 'node-fetch'
import constants from '../config/constants'
import { getMentors as api_getMentors } from '../pages/api/internal/mentors'

export async function getAllMentors(params) {
  return fakeApiCall(params)
}

export async function getOneMentorBySlug(slug, params) {
  return fakeApiCall({
    ...params,
    slug: slug,
  })
}

export async function getOneMentorById(id, params) {
  return fakeApiCall({
    ...params,
    id: id,
  })
}

export async function getOneMentorByRecordId(rec, params) {
  return fakeApiCall({
    ...params,
    rec: rec,
  })
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

async function fakeApiCall(params) {
  const res = await api_getMentors({
    show_hidden: params?.showHiddenFields,
    only_visible: params?.onlyVisible,
    force_refresh: params?.forceRefresh,
    id: params?.id,
    slug: params?.slug,
    rec: params?.rec,
  })

  if (res && (params.id || params.slug || params.rec)) {
    return res[0]
  } else {
    return res
  }
}
