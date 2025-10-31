import * as yup from 'yup'
import * as airtableMentors from '../../server/airtable-mentors'
import { getOneMentorById } from '../../server/mentors-data'
import filters from '../../config/filters'
import { withObservability } from '../../lib/with-observability'
import { profileUpdates } from '../../lib/metrics'
import logger from '../../lib/logger'

const bodySchema = yup.object().shape({
  name: yup.string().required(),
  job: yup.string().required(),
  workplace: yup.string().required(),
  experience: yup.string().required(),
  price: yup.string().required(),
  tags: yup.array().of(yup.string()).required(),
  description: yup.string().required(),
  about: yup.string().required(),
  competencies: yup.string().required(),
  calendarUrl: yup.string().optional(),
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

  const mentor = await getOneMentorById(req.query.id, { showHiddenFields: true })

  if (!mentor) {
    return res.status(404).send({ success: false, error: 'Mentor not found.' })
  }
  if (!req.query.token || mentor.authToken !== req.query.token) {
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
    await Promise.all([
      airtableMentors.updateMentor(mentor.airtableId, newProps),
      // forceRefreshCache(),
    ])

    profileUpdates.inc({ status: 'success' })

    logger.info('Mentor profile updated', {
      mentorId: mentor.id,
      airtableId: mentor.airtableId,
      fieldsUpdated: Object.keys(newProps),
    })
  } catch (e) {
    profileUpdates.inc({ status: 'error' })

    logger.error('Failed to update mentor profile', {
      mentorId: mentor.id,
      error: e.message,
    })
    return res.status(503).send({ success: false })
  }

  // This may be required in case there are issues with data inconsistency,
  // however it's highly unlikely. Commenting out the line to save on API call.
  // cachedMentors.forceResetCache().catch(console.error)

  res.send({ success: true })
}

export default withObservability(saveProfileHandler)
