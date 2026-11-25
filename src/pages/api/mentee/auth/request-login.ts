import type { NextApiRequest, NextApiResponse } from 'next'
import { getGoApiClient, HttpError } from '@/lib/go-api-client'
import { logError } from '@/lib/logger'
import { withObservability } from '@/lib/with-observability'

export const MENTEE_LOGIN_GENERIC_MESSAGE =
  'Если с этого email отправлялись заявки, мы прислали на него ссылку для входа'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/**
 * POST /api/mentee/auth/request-login
 * Ask for a mentee login link. The response is identical for known and unknown
 * emails. The email is never logged.
 */
async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const email: unknown = req.body?.email
  if (typeof email !== 'string' || email.length > 255 || !EMAIL_RE.test(email.trim())) {
    res.status(400).json({ success: false, message: 'Введите корректный email' })
    return
  }

  try {
    await getGoApiClient().menteeRequestLogin(email.trim())
    res.status(200).json({ success: true, message: MENTEE_LOGIN_GENERIC_MESSAGE })
  } catch (error) {
    if (error instanceof HttpError && error.statusCode === 429) {
      // Rate limits apply per email whether or not it is known, so this reveals nothing.
      res.status(429).json({
        success: false,
        message: 'Слишком много запросов. Попробуйте через несколько минут.',
      })
      return
    }
    if (error instanceof HttpError && error.statusCode >= 400 && error.statusCode < 500) {
      res.status(200).json({ success: true, message: MENTEE_LOGIN_GENERIC_MESSAGE })
      return
    }
    logError(new Error('Mentee request-login failed'), {
      context: 'mentee-request-login',
      statusCode: error instanceof HttpError ? error.statusCode : undefined,
    })
    res.status(500).json({ success: false, message: 'Internal server error' })
  }
}

export default withObservability(handler)
