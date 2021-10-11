import * as Sentry from '@sentry/nextjs'
import { getMentors } from '../../../server/cached-mentors'
import seo from '../../../config/seo'

const handler = async (req, res) => {
  // Only allow GET
  if (req.method !== 'GET') {
    return res.status(403).json({})
  }

  // Only allow authenticated requests
  if (req.headers?.mentors_api_auth_token !== process.env.MENTORS_API_LIST_AUTH_TOKEN) {
    return res.status(403).json({})
  }

  const allMentors = await getMentors()
  const m = allMentors.find((mentor) => mentor.id == req.query.id)

  if (m) {
    return res.status(200).json({
      id: m.id,
      name: m.name,
      title: m.job,
      workplace: m.workplace,
      about: m.about,
      description: m.description,
      competencies: m.competencies,
      experience: m.experience,
      price: m.price,
      doneSessions: m.menteeCount,
      photo: m.photo_url,
      tags: m.tags.join(','),
      link: `${seo.domain}/mentor/${m.slug}`,
    })
  } else {
    return res.status(404).json({})
  }
}

export default Sentry.withSentry(handler)
