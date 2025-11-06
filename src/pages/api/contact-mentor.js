/**
 * SECURITY: Next.js API proxy for contact-mentor endpoint
 * This allows Go API to remain on localhost only (not publicly exposed)
 * Client -> Next.js API Route (this file) -> Go API (localhost)
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Forward request to Go API via localhost
    const response = await fetch(`${process.env.GO_API_URL || 'http://localhost:8080'}/api/contact-mentor`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(req.body),
    })

    const data = await response.json()

    // Forward response status and data
    return res.status(response.status).json(data)
  } catch (error) {
    console.error('Contact mentor proxy error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
