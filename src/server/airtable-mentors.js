import Airtable from 'airtable'

const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID)

/**
 * @typedef Mentor
 * @param {number} id
 * @param {string} name
 * @param {string} job
 * @param {string} description
 * @param {string} price
 * @param {Object} photo
 * @param {string} photo_url
 * @param {string} experience
 * @param {number} menteeCount
 * @param {string[]} tags
 * @param {number} sortOrder
 */

/**
 * @returns {Promise<Mentor[]>}
 */
export async function getMentors() {

  const mentorsRaw = await base('Mentors').select({
    filterByFormula: 'OR(Status = "active", Status = "inactive")',
  }).all()

  /** @var {Mentor[]} mentors */
  const mentors = mentorsRaw.map(item => {
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
      photo_url: item.fields['Image'],
      tags: item.fields['Tags'].split(','),
      sortOrder: item.fields['SortOrder'],
      isVisible: (item.fields['OnSite'] === 1 && item.fields['Status'] === 'active'),
    }
  })

  mentors.sort((a, b) => {
    return a.sortOrder - b.sortOrder
  })

  return mentors
}
