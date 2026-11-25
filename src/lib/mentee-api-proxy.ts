import type { NextApiRequest, NextApiResponse } from 'next'
import { HttpError } from '@/lib/go-api-client'
import { logError } from '@/lib/logger'

/**
 * Forward a Go API error from a mentee route, keeping its status and JSON body.
 * Never logs the request body: it can hold an email, review text or a request id.
 */
export function sendMenteeProxyError(
  req: NextApiRequest,
  res: NextApiResponse,
  error: unknown,
  context: string
): void {
  if (error instanceof HttpError) {
    const status = error.statusCode >= 400 && error.statusCode < 600 ? error.statusCode : 500
    if (status >= 500) {
      logError(new Error(`Mentee proxy upstream error: ${status}`), { context, statusCode: status })
    }
    try {
      res.status(status).json(JSON.parse(error.body))
    } catch {
      res.status(status).json({ success: false, error: error.message })
    }
    return
  }

  logError(error instanceof Error ? error : new Error('Unknown mentee proxy error'), {
    context,
    method: req.method,
  })
  res.status(500).json({ success: false, error: 'Internal server error' })
}

/** Forward Set-Cookie from the Go API (session cookie set/clear). */
export function forwardSetCookie(res: NextApiResponse, headers: Headers): void {
  const setCookie = headers.get('set-cookie')
  if (setCookie) {
    res.setHeader('Set-Cookie', setCookie)
  }
}
