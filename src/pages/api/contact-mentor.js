import * as yup from 'yup'
import { createClientRequest } from '../../server/airtable-client-requests'

const schema = yup.object().shape({
  name: yup.string().required(),
  email: yup.string().email(),
  experience: yup.string().nullable(),
  mentorAirtableId: yup.string().required(),
  intro: yup.string().required(),
  telegramUsername: yup.string().required(),
})

export default async (req, res) => {
  await schema.validate(req.body)

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
