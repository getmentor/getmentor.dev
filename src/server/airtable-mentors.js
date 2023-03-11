import { airtableBase } from './airtable-base'
import { AUTH_TOKEN, CALENDAR_URL } from '../lib/entities'
import { getAllTagsCached } from './airtable-tags'
import allFilters from '../config/filters'
const Url = require('url')

/**
 * @returns {Promise<Mentor[]>}
 */

const TEST = process.env.NEXT_PUBLIC_TESTING_MODE

async function getMentorsInternal(formula = '') {
  if (process.env.AIRTABLE_WORK_OFFLINE > 0) {
    return testData()
  }

  const mentorsRaw = await airtableBase('Mentors')
    .select({
      filterByFormula: formula,
      view: 'All Approved',
      fields: [
        'Id',
        'Alias',
        'Name',
        'Description',
        'JobTitle',
        'Workplace',
        'Details',
        'About',
        'Competencies',
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
        'Calendly Url',
      ],
    })
    .all()

  /** @var {Mentor[]} mentors */
  const mentors = mentorsRaw.map((item) => {
    let tags = []
    if (item.fields['Tags']) {
      tags = item.fields['Tags'].split(',').map((tag) => tag.trim())
    }

    return {
      id: item.fields['Id'],
      airtableId: item.id,
      slug: item.fields['Alias'],
      name: item.fields['Name'],
      job: item.fields['JobTitle'] || '-',
      workplace: item.fields['Workplace'] || '-',
      description: item.fields['Details'],
      about: item.fields['About'] || '',
      competencies: item.fields['Competencies'] || '',
      experience: item.fields['Experience'],
      price: item.fields['Price'],
      menteeCount: item.fields['Done Sessions Count'],
      photo: item.fields['Image_Attachment'][0],
      photo_url: item.fields['Image'],
      tags: tags,
      sortOrder: item.fields['SortOrder'] || 10000,
      isVisible: item.fields['OnSite'] === 1 && item.fields['Status'] === 'active',
      sponsors: getMentorSponsor(tags),
      calendarType: calendarType(item.fields['Calendly Url']),

      // symbol props will not be serialized and sent to client
      // TODO token will not be serialized event you will want save it to cache
      [AUTH_TOKEN]: item.fields['AuthToken'],
      [CALENDAR_URL]: item.fields['Calendly Url'],
    }
  })

  mentors.sort((a, b) => {
    return a.sortOrder - b.sortOrder
  })

  return mentors
}

export async function getMentors() {
  if (TEST === 'on') {
    return null
  }
  return await getMentorsInternal()
}

export async function getMentorById(id) {
  if (TEST === 'on') {
    return null
  }
  const mentors = await getMentorsInternal(`Id = "${id}"`)

  return mentors.length === 1 ? mentors[0] : undefined
}

export async function getMentorByRecordId(recordId) {
  if (TEST === 'on') {
    return null
  }
  const mentors = await getMentorsInternal(`RECORD_ID() = "${recordId}"`)

  return mentors.length === 1 ? mentors[0] : undefined
}

export async function getMentorBySlug(slug) {
  if (TEST === 'on') {
    return null
  }
  const mentors = await getMentorsInternal(`Alias = "${slug}"`)

  return mentors.length === 1 ? mentors[0] : undefined
}

/**
 * @param {string} recordId
 * @param {Mentor} mentor
 * @returns {Promise<Record>}
 */
export async function updateMentor(recordId, mentor) {
  if (TEST === 'on') {
    return null
  }
  let allTags = await getAllTagsCached()
  mentor.calendarType = calendarType(mentor.calendarUrl)

  return airtableBase('Mentors').update(recordId, {
    Alias: mentor.slug,
    Name: mentor.name,
    JobTitle: mentor.job,
    Workplace: mentor.workplace,
    Details: mentor.description,
    About: mentor.about,
    Competencies: mentor.competencies,
    Experience: mentor.experience,
    Price: mentor.price,
    'Calendly Url': mentor.calendarUrl,
    'Tags Links': mentor.tags.map((tagName) => allTags[tagName]),
  })
}

function getMentorSponsor(tags) {
  if (TEST === 'on') {
    return null
  }
  const sponsors = []
  tags.forEach((t) => {
    if (allFilters.sponsors.includes(t)) {
      sponsors.push(t)
    }
  })

  return sponsors.length === 0 ? 'none' : sponsors.join('|')
}

function calendarType(url) {
  if (!url) {
    return 'none'
  }

  try {
    var u = Url.parse(url)
    if (u.hostname === 'calendly.com') return 'calendly'
    if (u.hostname === 'koalendar.com') return 'koalendar'
    else return 'url'
  } catch (_) {
    return 'none'
  }
}

function testData() {
  return [
    {
      id: '1',
      airtableId: 'rec123',
      slug: 'georgiy-mogelashvili-1',
      name: 'Георгий Могелашвили',
      job: 'Lead Developer',
      workplace: 'Booking.com',
      description: 'Тестовые данные, всем привет!',
      about: 'Тестовый раздел обо мне',
      competencies: 'тест, test',
      experience: '10+',
      price: '1000 руб',
      menteeCount: '5',
      photo: {},
      photo_url: '/images/patreon.png',
      tags: 'Backend,Frontend,Agile,Сообщество Онтико',
      sortOrder: 1,
      isVisible: 1,
      sponsors: 'Сообщество Онтико',
      calendarType: 'none',

      // symbol props will not be serialized and sent to client
      // TODO token will not be serialized event you will want save it to cache
      [AUTH_TOKEN]: 'afas',
      [CALENDAR_URL]: 'https://calendly.com/',
    },
  ]
}
