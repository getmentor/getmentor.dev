import Airtable from 'airtable'

const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID)
const airtableMentors = base('Mentors')

/**
 * @typedef Mentor
 * @param {number} id
 * @param {string} name
 * @param {string} job
 * @param {string} description
 * @param {string} price
 * @param {Object} photo
 * @param {string} experience
 * @param {number} menteeCount
 * @param {string[]} tags
 */

/**
 * @returns {Promise<Mentor[]>}
 */
export async function getMentors() {
  const items = await airtableMentors.select({
    sort: [{ field: 'Sort Order', direction: 'asc' }],
  }).all()

  return items.map(item => formatRecord(item))
}

/**
 * @param {string} id
 * @returns {Promise<Mentor>}
 */
export async function getMentor(id) {
  const item = await airtableMentors.find(id)
  return formatRecord(item)
}

function formatRecord(item) {
  return {
    id: item.id,
    slug: item.fields['Slug'],
    name: item.fields['Name'],
    job: item.fields['Должность'],
    description: item.fields['Описание'],
    experience: item.fields['Опыт'],
    price: item.fields['Цена'],
    menteeCount: item.fields['Проведено сессий'],
    photo: item.fields['Фото'][0],
    tags: item.fields['Теги'],
  }
}
