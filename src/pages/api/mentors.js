import { getAllMentors } from '../../server/mentors-data'
import seo from '../../config/seo'
import Cors from 'cors'
import initMiddleware from '../../lib/init-middleware'
import { imageLoader } from '../../lib/azure-image-loader'
import { withObservability } from '../../lib/with-observability'

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
    req.headers?.mentors_api_auth_token !== process.env.MENTORS_API_LIST_AUTH_TOKEN_INNO &&
    req.query?.ai_secret !== process.env.MENTORS_API_LIST_AUTH_TOKEN_AIKB
  ) {
    return res.status(403).json({})
  }

  const allMentors = await getAllMentors({ onlyVisible: true })

  const mentors = allMentors.map((m) => {
    return {
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
      photo: imageLoader({ src: m.slug, quality: 'large' }),
      tags: m.tags.join(','),
      link: `${seo.domain}/mentor/${m.slug}`,
    }
  })

  return res.status(200).json({ mentors })
}

export default withObservability(handler)
