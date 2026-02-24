import type { NextApiRequest, NextApiResponse } from 'next'
import { getGoApiClient, HttpError } from '@/lib/go-api-client'
import { logError } from '@/lib/logger'
import { withObservability } from '@/lib/with-observability'

async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const { email } = req.body
  if (!email || typeof email !== 'string') {
    res.status(400).json({ success: false, message: 'Email is required' })
    return
  }

  const genericSuccessResponse = {
    success: true,
    message: 'Если ваш email зарегистрирован в системе, вы получите ссылку для входа',
  }

  try {
    const client = getGoApiClient()
    await client.adminRequestLogin(email)
    res.status(200).json(genericSuccessResponse)
  } catch (error) {
    if (error instanceof HttpError) {
      logError(new Error(`Admin request login failed: ${error.statusCode} ${error.body}`), {
        context: 'admin-request-login',
        email,
        statusCode: error.statusCode,
      })

      if (error.statusCode >= 400 && error.statusCode < 500) {
        res.status(200).json(genericSuccessResponse)
        return
      }

      res.status(500).json({ success: false, message: 'Internal server error' })
      return
    }

    if (error instanceof Error) {
      logError(error, { context: 'admin-request-login', method: req.method, url: req.url })
    }
    res.status(500).json({ success: false, message: 'Internal server error' })
  }
}

export default withObservability(handler)
