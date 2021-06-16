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
  const mentorsSortRaw = await base('MentorsView').select({
    fields: ['Mentor', 'Sort Order'],
    filterByFormula: 'OnSite = 1',
    view: "SiteView"
  }).all()

  const mentorsSortById = {}
  for (const item of mentorsSortRaw) {
    const recId = item.fields['Mentor'][0]
    const sortOrder = item.fields['Sort Order']
    mentorsSortById[recId] = sortOrder
  }

  const mentorsRaw = await base('Mentors').select({
    filterByFormula: 'OnSite = 1',
    view: "SiteView"
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
      sortOrder: mentorsSortById[ item.id ],
    }
  })

  mentors.sort((a, b) => {
    return a.sortOrder - b.sortOrder
  })

  return mentors
}
