describe('analytics', () => {
  beforeEach(() => {
    jest.useFakeTimers()
    jest.resetModules()
    delete window.mixpanel
  })

  afterEach(() => {
    jest.useRealTimers()
    delete window.mixpanel
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
})
