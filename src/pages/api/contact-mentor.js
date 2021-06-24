import * as yup from 'yup'
import { createClientRequest } from '../../server/airtable-client-requests'

const bodySchema = yup.object().shape({
  name: yup.string().required(),
  email: yup.string().email(),
  experience: yup.string().nullable(),
  mentorAirtableId: yup.string().required(),
  intro: yup.string().required(),
  telegramUsername: yup.string().required(),
})

const rateLimitLog = {}

export default async (req, res) => {
  await bodySchema.validate(req.body)

  try {
    validateRateLimit('any request', 500)
    validateRateLimit(req.body['mentorAirtableId'], 1000)
  } catch (e) {
    res.status(429).json({ success: false, error: 'Rate limit reached.' })
    return
  }

  await createClientRequest({
    Email: req.body['email'],
    Name: req.body['name'],
    Level: req.body['experience'] || null,
    Mentor: [req.body['mentorAirtableId']],
    Description: req.body['intro'],
    Telegram: req.body['telegramUsername'],
  })

  res.status(200).json({ success: true })
}

/**
 * @param {string} limitKey
 * @param {number} timeout
 */
function validateRateLimit(limitKey, timeout) {
  const latestRequestTime = rateLimitLog[limitKey]
  const isValidRequest = !latestRequestTime || latestRequestTime < Date.now() - timeout

  if (isValidRequest) {
    rateLimitLog[limitKey] = Date.now()
  } else {
    throw new Error('Rate limit reached')
  }
}
