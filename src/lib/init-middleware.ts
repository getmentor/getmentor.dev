import type { NextApiRequest, NextApiResponse } from 'next'

type MiddlewareCallback = (result?: unknown) => void
type Middleware = (
  req: NextApiRequest,
  res: NextApiResponse,
  callback: MiddlewareCallback
) => void

/**
 * Helper method to wait for a middleware to execute before continuing
 * And to throw an error when an error happens in a middleware
 */
export default function initMiddleware(
  middleware: Middleware
): (req: NextApiRequest, res: NextApiResponse) => Promise<unknown> {
  return (req: NextApiRequest, res: NextApiResponse) =>
    new Promise((resolve, reject) => {
      middleware(req, res, (result?: unknown) => {
        if (result instanceof Error) {
          return reject(result)
        }
        return resolve(result)
      })
    })
}
