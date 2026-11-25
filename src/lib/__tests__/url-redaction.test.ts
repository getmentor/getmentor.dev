import { redactSecretUrlParams } from '@/lib/url-redaction'
import { redactPostHogEvent } from '@/lib/posthog'
import type { CaptureResult } from 'posthog-js'

jest.mock('posthog-js', () => ({ __esModule: true, default: { init: jest.fn() } }))

describe('redactSecretUrlParams', () => {
  it('redacts login tokens and review-link request ids', () => {
    expect(
      redactSecretUrlParams(
        `https://getmentor.dev/mentee/auth/callback?token=mntk_${'a'.repeat(64)}`
      )
    ).toBe('https://getmentor.dev/mentee/auth/callback?token=[redacted]')
    expect(redactSecretUrlParams('https://getmentor.dev/reviews/new?x=1&request_id=abc#top')).toBe(
      'https://getmentor.dev/reviews/new?x=1&request_id=[redacted]#top'
    )
    expect(redactSecretUrlParams('https://getmentor.dev/mentor?page=2')).toBe(
      'https://getmentor.dev/mentor?page=2'
    )
  })
})

describe('PostHog before_send', () => {
  it('redacts secrets from the pageview URL and person properties', () => {
    const url = `https://getmentor.dev/mentee/auth/callback?token=mntk_${'b'.repeat(64)}`
    const event = {
      event: '$pageview',
      uuid: 'u',
      properties: { $current_url: url, $referrer: url, nested: { $initial_current_url: url } },
      $set_once: { $initial_current_url: url },
    } as unknown as CaptureResult
    const out = JSON.stringify(redactPostHogEvent(event))
    expect(out).not.toContain('mntk_')
    expect(out).toContain('token=[redacted]')
  })
})
