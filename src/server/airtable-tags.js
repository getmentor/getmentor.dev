import { airtableBase } from './airtable-base'
const NodeCache = require('node-cache')

// let default TTL be 24 hours
const tagsCache = new NodeCache({ stdTTL: 24 * 60 * 60, checkperiod: 60 * 60 })
const cacheKeyByName = 'tags_by_name'
const cacheKeyRaw = 'tags_raw'

// init the cache on startup
if (process.env.APP_ENV === 'production') {
  getAllTagsCached()
}

export async function getAllTags() {
  return await airtableBase('Tags').select().all()
}

export async function getAllTagsCached() {
  var tagsFromCache = tagsCache.get(cacheKeyByName)
  if (tagsFromCache) {
    return tagsFromCache
  }

  const tags = await getAllTags()
  let tagsRecordIdsByName = {}
  for (const tag of tags) {
    tagsRecordIdsByName[tag.fields['Name']] = tag.id
  }
  tagsCache.set(cacheKeyByName, tagsRecordIdsByName)
  tagsCache.set(cacheKeyRaw, tags)

  return tagsRecordIdsByName
}

export async function getTagIdByName(tagName) {
  var tags = await getAllTagsCached()
  return tags[tagName]
}

export async function getAllTagsNames() {
  var tags = await getAllTagsCached()
  return tags.keys()
}
