import Airtable from 'airtable'
const NodeCache = require('node-cache')

// let default TTL be 24 hours
const tagsCache = new NodeCache({ stdTTL: 24 * 60 * 60, checkperiod: 60 * 60 })
const cacheKeyByName = 'tags_by_name'
const cacheKeyRaw = 'tags_raw'

const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(
  process.env.AIRTABLE_BASE_ID
)

export async function getAllTags() {
  var tagsFromCache = tagsCache.get(cacheKeyByName)
  if (tagsFromCache) {
    return tagsFromCache
  }

  const tags = await base('Tags').select().all()
  let tagsRecordIdsByName = {}
  for (const tag of tags) {
    tagsRecordIdsByName[tag.fields['Name']] = tag.id
  }
  tagsCache.set(cacheKeyByName, tagsRecordIdsByName)
  tagsCache.set(cacheKeyRaw, tags)

  return tagsRecordIdsByName
}

export async function getTagIdByName(tagName) {
  var tags = await getAllTags()
  return tags[tagName]
}

export async function getAllTagsNames() {
  var tags = await getAllTags()
  return tags.keys()
}
