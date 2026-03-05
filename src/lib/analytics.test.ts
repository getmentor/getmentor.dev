describe('analytics', () => {
  beforeEach(() => {
    jest.useFakeTimers()
    jest.resetModules()
    delete window.mixpanel
    delete window.posthog
    delete process.env.NEXT_PUBLIC_ANALYTICS_PROVIDER
  })

  afterEach(() => {
    jest.useRealTimers()
    delete window.mixpanel
    delete window.posthog
  })

  it('sanitizes properties and adds common metadata', async () => {
    const track = jest.fn()
    const identify = jest.fn()
    const reset = jest.fn()
    const setPeople = jest.fn()
    window.mixpanel = {
      track,
      identify,
      reset,
      init: jest.fn(),
      people: { set: setPeople },
    }

    const { default: analytics, analyticsEvents } = await import('@/lib/analytics')
    analytics.event(analyticsEvents.MENTOR_REGISTRATION_SUBMITTED, {
      email: 'private@getmentor.dev',
      name: 'Private Mentor',
      tags_count: 3,
    })

    expect(track).toHaveBeenCalledTimes(1)
    const [, payload] = track.mock.calls[0]
    expect(payload).toMatchObject({
      tags_count: 3,
      source_system: 'frontend',
      event_version: 'v1',
    })
    expect(payload.email).toBeUndefined()
    expect(payload.name).toBeUndefined()
  })

  it('keeps safe aggregate keys that include blocked fragments', async () => {
    const track = jest.fn()
    window.mixpanel = {
      track,
      identify: jest.fn(),
      reset: jest.fn(),
      init: jest.fn(),
      people: { set: jest.fn() },
    }

    const { default: analytics, analyticsEvents } = await import('@/lib/analytics')
    analytics.event(analyticsEvents.MENTEE_CONTACT_SUBMITTED, {
      has_telegram_username: true,
      review_id: 'rev_123',
      mentor_review: 'raw review text',
    })

    expect(track).toHaveBeenCalledTimes(1)
    const [, payload] = track.mock.calls[0]
    expect(payload).toMatchObject({
      has_telegram_username: true,
      review_id: 'rev_123',
    })
    expect(payload.mentor_review).toBeUndefined()
  })

  it('queues track events until mixpanel is available', async () => {
    const { default: analytics, analyticsEvents } = await import('@/lib/analytics')
    analytics.event(analyticsEvents.HOME_PAGE_VIEWED, { foo: 'bar' })

    const track = jest.fn()
    window.mixpanel = {
      track,
      identify: jest.fn(),
      reset: jest.fn(),
      init: jest.fn(),
      people: { set: jest.fn() },
    }

    jest.runOnlyPendingTimers()

    expect(track).toHaveBeenCalledTimes(1)
    const [eventName, payload] = track.mock.calls[0]
    expect(eventName).toBe(analyticsEvents.HOME_PAGE_VIEWED)
    expect(payload).toMatchObject({ foo: 'bar' })
  })

  it('queues identify and reset commands until mixpanel is available', async () => {
    const { default: analytics } = await import('@/lib/analytics')
    analytics.identify('mentor:123', {
      role: 'mentor',
      email: 'private@getmentor.dev',
    })
    analytics.reset()

    const identify = jest.fn()
    const setPeople = jest.fn()
    const reset = jest.fn()
    window.mixpanel = {
      track: jest.fn(),
      identify,
      reset,
      init: jest.fn(),
      people: { set: setPeople },
    }

    jest.runOnlyPendingTimers()

    expect(identify).toHaveBeenCalledWith('mentor:123')
    expect(setPeople).toHaveBeenCalledWith({ role: 'mentor' })
    expect(reset).toHaveBeenCalledTimes(1)
  })

  it('stops retry loop and drops queued commands when mixpanel never loads', async () => {
    const { default: analytics, analyticsEvents } = await import('@/lib/analytics')
    analytics.event(analyticsEvents.HOME_PAGE_VIEWED, { foo: 'bar' })

    for (let i = 0; i < 30; i += 1) {
      jest.runOnlyPendingTimers()
    }

    const track = jest.fn()
    window.mixpanel = {
      track,
      identify: jest.fn(),
      reset: jest.fn(),
      init: jest.fn(),
      people: { set: jest.fn() },
    }

    jest.runOnlyPendingTimers()
    expect(track).toHaveBeenCalledTimes(0)
  })

  it('queues posthog events until posthog is available', async () => {
    process.env.NEXT_PUBLIC_ANALYTICS_PROVIDER = 'posthog'

    const { default: analytics, analyticsEvents } = await import('@/lib/analytics')
    analytics.event(analyticsEvents.HOME_PAGE_VIEWED, {
      foo: 'bar',
      email: 'private@getmentor.dev',
    })

    const capture = jest.fn()
    window.posthog = {
      capture,
      identify: jest.fn(),
      reset: jest.fn(),
    }

    jest.runOnlyPendingTimers()

    expect(capture).toHaveBeenCalledTimes(1)
    const [eventName, properties] = capture.mock.calls[0]
    expect(eventName).toBe(analyticsEvents.HOME_PAGE_VIEWED)
    expect(properties).toMatchObject({
      foo: 'bar',
      source_system: 'frontend',
      event_version: 'v1',
    })
    expect(properties.email).toBeUndefined()
  })

  it('queues identify and reset commands until posthog is available', async () => {
    process.env.NEXT_PUBLIC_ANALYTICS_PROVIDER = 'posthog'

    const { default: analytics } = await import('@/lib/analytics')
    analytics.identify('mentor:123', {
      role: 'mentor',
      email: 'private@getmentor.dev',
    })
    analytics.reset()

    const identify = jest.fn()
    const reset = jest.fn()
    window.posthog = {
      capture: jest.fn(),
      identify,
      reset,
    }

    jest.runOnlyPendingTimers()

    expect(identify).toHaveBeenCalledWith('mentor:123', { role: 'mentor' })
    expect(reset).toHaveBeenCalledTimes(1)
  })
})
