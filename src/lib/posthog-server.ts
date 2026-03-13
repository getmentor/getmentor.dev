import { PostHog } from 'posthog-node'

let serverClient: PostHog | null = null

export function getPostHogServerClient(): PostHog | null {
  if (serverClient) return serverClient

  const apiKey = process.env.NEXT_PUBLIC_POSTHOG_KEY
  if (!apiKey) return null

  serverClient = new PostHog(apiKey, {
    host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://eu.i.posthog.com',
    flushAt: 1,
    flushInterval: 0,
  })

  return serverClient
}
