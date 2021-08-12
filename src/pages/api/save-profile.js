import { withSentry } from '@sentry/nextjs'
import * as yup from 'yup'
import { updateMentor } from '../../server/airtable-mentors'
import { getMentors, forceResetCache } from '../../server/cached-mentors'
import { AUTH_TOKEN } from '../../lib/entities'

const bodySchema = yup.object().shape({
  name: yup.string().required(),
  job: yup.string().required(),
  experience: yup.string().required(),
  price: yup.string().required(),
  tags: yup.array().of(yup.string()).required(),
  description: yup.string().required(),
})

const saveProfileHandler = async (req, res) => {
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

  const mentors = await getMentors()
  const mentor = mentors.find((mentor) => String(mentor.id) === req.query.id)
  if (!mentor) {
    return res.status(404).send({ success: false, error: 'Mentor not found.' })
  }
  if (!req.query.token || mentor[AUTH_TOKEN] !== req.query.token) {
    return res.status(403).send({ success: false, error: 'Access denied.' })
  }

  await updateMentor(mentor.airtableId, req.body)
  await forceResetCache()

  res.send({ success: true })
}

export default withSentry(saveProfileHandler)
