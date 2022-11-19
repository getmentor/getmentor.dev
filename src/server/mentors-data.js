import {
  getMentors as getUncachedMentors,
  getMentorById as getUncachedMentorById,
  getMentorBySlug as getUncachedMentorBySlug,
  getMentorByRecordId as getUncachedMentorByRecordId,
} from './airtable-mentors'

export async function getAllMentors(all_fields, show_hidden) {
  const allMentors = await getUncachedMentors()

  const filteredMentors = show_hidden ? allMentors : allMentors.filter((mentor) => mentor.isVisible)

  if (all_fields) {
    return filteredMentors
  } else {
    const mentors = filteredMentors.map((m) => {
      return {
        id: m.id,
        slug: m.slug,
        name: m.name,
        job: m.job,
        workplace: m.workplace,
        description: m.description,
        competencies: m.competencies,
        about: m.about,
        experience: m.experience,
        price: m.price,
        menteeCount: m.menteeCount,
        photo: m.photo,
        photo_url: m.photo_url,
        sortOrder: m.sortOrder,
        tags: m.tags,
        sponsors: m.sponsors,
      }
    })

    return mentors
  }
}

export async function getOneMentorBySlug(slug) {
  return await getUncachedMentorBySlug(slug)
}

export async function getOneMentorById(id) {
  return await getUncachedMentorById(id)
}

export async function getOneMentorByRecordId(recordId) {
  return await getUncachedMentorByRecordId(recordId)
}
