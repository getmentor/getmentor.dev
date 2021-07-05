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
      console.error(e)
      res.status(400).json({ success: false, error: 'Captcha failed.' })
      return
    })

  if (captchaResult && captchaResult.success) {
    await createClientRequest({
      Email: req.body['email'],
      Name: req.body['name'],
      Level: req.body['experience'] || null,
      Mentor: [req.body['mentorAirtableId']],
      Description: req.body['intro'],
      Telegram: req.body['telegramUsername'],
    })

    res.status(200).json({ success: true })
  } else {
    console.warn('Captcha validation failed')
    res.status(400).json({ success: false, error: 'Captcha validation failed' })
  }
}
