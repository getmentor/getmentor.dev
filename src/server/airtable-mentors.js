import Airtable from 'airtable'

const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID)
const airtableMentors = base('Mentors Prod')

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
    view: 'Site View',
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
    slug: item.fields['Alias'],
    name: item.fields['Title'],
    job: item.fields['Description'],
    description: item.fields['Details'],
    experience: item.fields['Extra_1'],
    price: item.fields['Extra_3'],
    menteeCount: item.fields['Done Sessions Count'],
    photo: item.fields['Image_Attachment'][0],
    tags: item.fields['Tags'].split(','),
  }
}
