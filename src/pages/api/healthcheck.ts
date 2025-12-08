import type { NextApiRequest, NextApiResponse } from 'next'
import { withObservability } from '@/lib/with-observability'

function handler(_req: NextApiRequest, res: NextApiResponse): void {
  res.setHeader('Cache-Control', 'no-cache, no-store, max-age=0, must-revalidate')
  res.status(200).json({})
}

export default withObservability(handler)
