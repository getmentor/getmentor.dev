import Airtable from 'airtable'
import { AUTH_TOKEN } from '../lib/entities'
import { getAllTags } from './airtable-tags'

const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(
  process.env.AIRTABLE_BASE_ID
)

/**
 * @returns {Promise<Mentor[]>}
 */
export async function getMentors() {
  const mentorsRaw = await base('Mentors')
    .select({
      filterByFormula: 'OR(Status = "active", Status = "inactive")',
      fields: [
        'Id',
        'Alias',
        'Title',
        'Description',
        'Details',
        'Experience',
        'Price',
        'Done Sessions Count',
        'Image_Attachment',
        'Image',
        'Tags',
        'SortOrder',
        'OnSite',
        'Status',
        'AuthToken',
      ],
    })
    .all()

  /** @var {Mentor[]} mentors */
  const mentors = mentorsRaw.map((item) => {
    return {
      id: item.fields['Id'],
      airtableId: item.id,
      slug: item.fields['Alias'],
      name: item.fields['Title'],
      job: item.fields['Description'],
      description: item.fields['Details'],
      experience: item.fields['Experience'],
      price: item.fields['Price'],
      menteeCount: item.fields['Done Sessions Count'],
      photo: item.fields['Image_Attachment'][0],
      photo_url: item.fields['Image'],
      tags: item.fields['Tags'].split(',').map((tag) => tag.trim()),
      sortOrder: item.fields['SortOrder'],
      isVisible: item.fields['OnSite'] === 1 && item.fields['Status'] === 'active',

      // symbol props will not be serialized and sent to client
      // TODO token will not be serialized event you will want save it to cache
      [AUTH_TOKEN]: item.fields['AuthToken'],
    }
  })

  mentors.sort((a, b) => {
    return a.sortOrder - b.sortOrder
  })

  return mentors
}

/**
 * @param {string} recordId
 * @param {Mentor} mentor
 * @returns {Promise<Record>}
 */
export async function updateMentor(recordId, mentor) {
  let allTags = await getAllTags()

  return base('Mentors').update(recordId, {
    Alias: mentor.slug,
    Title: mentor.name,
    Description: mentor.job,
    Details: mentor.description,
    Experience: mentor.experience,
    Price: mentor.price,
    'Tags Links': mentor.tags.map((tagName) => allTags[tagName]),
  })
}
