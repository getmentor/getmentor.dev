import type { NextApiRequest, NextApiResponse } from 'next'
import { HttpError } from '@/lib/go-api-client'
import { logError } from '@/lib/logger'

/**
 * Forward a Go API error to the client, keeping its status and JSON body.
 * Unexpected errors are logged and returned as 500.
 */
export function sendAdminProxyError(
  req: NextApiRequest,
  res: NextApiResponse,
  error: unknown,
  context: string
): void {
  if (error instanceof HttpError) {
    const statusCode = error.statusCode >= 400 && error.statusCode < 600 ? error.statusCode : 500
    try {
      res.status(statusCode).json(JSON.parse(error.body))
    } catch {
      res.status(statusCode).json({ error: error.message })
    }
    return
  }

  if (error instanceof Error) {
    logError(error, { context, method: req.method, url: req.url })
  }
  res.status(500).json({ error: 'Internal server error' })
}

export function getSingleQueryParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value
}
