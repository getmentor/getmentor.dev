import * as Sentry from '@sentry/nextjs'
import { getOneMentorById } from '../../../server/mentors-data'
import seo from '../../../config/seo'
import Cors from 'cors'
import initMiddleware from '../../../lib/init-middleware'

// Initialize the cors middleware
const cors = initMiddleware(
  // You can read more about the available options here: https://github.com/expressjs/cors#configuration-options
  Cors({
    // Only allow requests with GET and OPTIONS
    methods: ['GET', 'OPTIONS'],
  })
)

const handler = async (req, res) => {
  await cors(req, res)

  // Only allow GET
  if (req.method !== 'GET') {
    return res.status(403).json({})
  }

  // Only allow authenticated requests
  if (
    req.headers?.mentors_api_auth_token !== process.env.MENTORS_API_LIST_AUTH_TOKEN &&
    req.headers?.mentors_api_auth_token !== process.env.MENTORS_API_LIST_AUTH_TOKEN_INNO
  ) {
    return res.status(403).json({})
  }

  req.query.id = parseInt(req.query.id, 10)
  const m = await getOneMentorById(req.query.id)

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
