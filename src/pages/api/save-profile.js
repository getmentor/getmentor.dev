import * as Sentry from '@sentry/nextjs'
import * as yup from 'yup'
import * as airtableMentors from '../../server/airtable-mentors'
import * as cachedMentors from '../../server/cached-mentors'
import { AUTH_TOKEN } from '../../lib/entities'
import filters from '../../config/filters'

const bodySchema = yup.object().shape({
  name: yup.string().required(),
  job: yup.string().required(),
  experience: yup.string().required(),
  price: yup.string().required(),
  tags: yup.array().of(yup.string()).required(),
  description: yup.string().required(),
})

const saveProfileHandler = async (req, res) => {
  req.query.id = parseInt(req.query.id, 10)
  if (isNaN(req.query.id)) {
    return res.status(404).send({ success: false, error: 'Mentor not found.' })
  }

  try {
    await bodySchema.validate(req.body)
  } catch (e) {
    if (e.name === 'ValidationError') {
      return res
        .status(400)
        .send({ success: false, error: 'Validation Failed', validation: e.errors })
    } else {
      return res.status(400).send({ success: false, error: e.name })
    }
  }

  const mentors = await cachedMentors.getMentors()
  const mentor = mentors.find((mentor) => mentor.id === req.query.id)
  if (!mentor) {
    return res.status(404).send({ success: false, error: 'Mentor not found.' })
  }
  if (!req.query.token || mentor[AUTH_TOKEN] !== req.query.token) {
    return res.status(403).send({ success: false, error: 'Access denied.' })
  }

  /** @var {Mentor} newProps */
  const newProps = {
    ...req.body,

    // sponsor tags will not be shown in profile edit form
    // add them back if mentor had any
    tags: [...req.body.tags, ...mentor.tags.filter((tag) => filters.sponsors.includes(tag))],
  }

  try {
    await airtableMentors.updateMentor(mentor.airtableId, newProps)
    cachedMentors.updateMentor(mentor.airtableId, newProps)
  } catch (e) {
    Sentry.captureException(`Error: ${e.message}; ErrorCode: ${e.error}; Status: ${e.statusCode}`)
    return res.status(503).send({ success: false })
  }

  // This may be required in case there are issues with data inconsistency,
  // however it's highly unlikely. Commenting out the line to save on API call.
  // cachedMentors.forceResetCache().catch(console.error)

  res.send({ success: true })
}

export default Sentry.withSentry(saveProfileHandler)
