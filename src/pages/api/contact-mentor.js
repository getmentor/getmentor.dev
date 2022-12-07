import * as Sentry from '@sentry/nextjs'
import * as yup from 'yup'
import { createClientRequest } from '../../server/airtable-client-requests'
import { getOneMentorByRecordId } from '../../server/mentors-data'

require('../../lib/load-appinsights')

const bodySchema = yup.object().shape({
  name: yup.string().required(),
  email: yup.string().email(),
  experience: yup.string().nullable(),
  mentorAirtableId: yup.string().required(),
  intro: yup.string().required(),
  telegramUsername: yup.string().required(),
})

const handler = async (req, res) => {
  await bodySchema.validate(req.body)

  let url = `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_V2_SECRET_KEY}&response=${req.body['recaptchaToken']}`

  let captchaResult = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8',
    },
  })
    .then((res) => {
      return res.json()
    })
    .catch((e) => {
      Sentry.captureException('Captcha exception: ' + JSON.stringify(e))
      return res.status(400).json({ success: false, error: 'Captcha failed.' })
    })

  if (captchaResult && captchaResult.success) {
    if (process.env.NODE_ENV !== 'development') {
      try {
        await createClientRequest({
          Email: req.body['email'],
          Name: req.body['name'],
          Level: req.body['experience'] || null,
          Mentor: [req.body['mentorAirtableId']],
          Description: req.body['intro'],
          Telegram: req.body['telegramUsername'],
        })
      } catch (e) {
        Sentry.captureException('Create request failed: ' + JSON.stringify(e))
        return res.status(400).json({ success: false, error: 'Save to storage failed' })
      }
    }
  } else {
    console.warn('Captcha validation failed')
    return res.status(400).json({ success: false, error: 'Captcha validation failed' })
  }

  const mentor = await getOneMentorByRecordId(req.body['mentorAirtableId'], {
    showHiddenFields: true,
  })
  res.status(200).json({ success: true, calendar_url: mentor.calendarUrl })
}

export default Sentry.withSentry(handler)
