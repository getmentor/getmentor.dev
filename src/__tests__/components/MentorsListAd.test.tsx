import { render, cleanup, act, screen } from '@testing-library/react'
import MentorsListAd from '@/components/mentors/MentorsListAd'

interface RenderCall {
  blockId: string
  renderTo: string
}

declare global {
  interface Window {
    __yaRenderCalls?: RenderCall[]
    __yaDestroyCalls?: RenderCall[]
  }
}

function installFakeYa(): void {
  window.__yaRenderCalls = []
  window.__yaDestroyCalls = []
  window.Ya = {
    Context: {
      AdvManager: {
        render: (opts: RenderCall) => {
          window.__yaRenderCalls?.push(opts)
        },
        destroy: (opts: RenderCall) => {
          window.__yaDestroyCalls?.push(opts)
        },
      },
    },
  }
  // Mimic Yandex's loader behavior: anything pushed to yaContextCb is
  // executed immediately once the SDK is available.
  const queue: Array<() => void> = []
  window.yaContextCb = Object.assign(queue, {
    push: (cb: () => void) => {
      cb()
      return queue.length
    },
  })
}

function uninstallFakeYa(): void {
  delete window.Ya
  delete window.yaContextCb
  delete window.__yaRenderCalls
  delete window.__yaDestroyCalls
  delete window.getmentorAds
}

describe('MentorsListAd', () => {
  beforeEach(() => {
    installFakeYa()
  })

  afterEach(() => {
    cleanup()
    uninstallFakeYa()
  })

  it('renders a slot with the configured id', () => {
    const { container } = render(<MentorsListAd id="my-slot" blockId="R-X-1" />)
    expect(container.querySelector('#my-slot')).not.toBeNull()
  })

  it('calls Ya render with the configured block id and slot id on mount', () => {
    render(<MentorsListAd id="my-slot" blockId="R-X-1" />)
    expect(window.__yaRenderCalls).toEqual([{ blockId: 'R-X-1', renderTo: 'my-slot' }])
  })

  it('calls Ya destroy on unmount', () => {
    const { unmount } = render(<MentorsListAd id="my-slot" blockId="R-X-1" />)
    expect(window.__yaDestroyCalls).toHaveLength(1) // destroy-then-render on mount
    unmount()
    expect(window.__yaDestroyCalls).toHaveLength(2)
    expect(window.__yaDestroyCalls?.[1]).toEqual({ blockId: 'R-X-1', renderTo: 'my-slot' })
  })

  it('queues callbacks safely when Yandex SDK is not loaded yet', () => {
    // Reset to a plain array (SDK has not arrived).
    window.yaContextCb = []
    delete window.Ya

    const { unmount } = render(<MentorsListAd id="my-slot" blockId="R-X-1" />)
    expect(window.yaContextCb).toHaveLength(1)

    unmount()
    expect(window.yaContextCb).toHaveLength(2)
  })

  it('re-runs render when re-mounted (simulating a filter change)', () => {
    const { unmount } = render(<MentorsListAd id="my-slot" blockId="R-X-1" />)
    expect(window.__yaRenderCalls).toHaveLength(1)
    unmount()

    render(<MentorsListAd id="my-slot" blockId="R-X-1" />)
    expect(window.__yaRenderCalls).toHaveLength(2)
  })

  it('reads block id from window.getmentorAds when no prop is passed', () => {
    window.getmentorAds = { mentorsListBlockId: 'R-FROM-GTM-1' }
    render(<MentorsListAd id="my-slot" />)
    expect(window.__yaRenderCalls).toEqual([{ blockId: 'R-FROM-GTM-1', renderTo: 'my-slot' }])
  })

  it('prop blockId overrides window.getmentorAds', () => {
    window.getmentorAds = { mentorsListBlockId: 'R-FROM-GTM-1' }
    render(<MentorsListAd id="my-slot" blockId="R-PROP-1" />)
    expect(window.__yaRenderCalls).toEqual([{ blockId: 'R-PROP-1', renderTo: 'my-slot' }])
  })

  it('does not call render when no block id is configured anywhere', () => {
    render(<MentorsListAd id="my-slot" />)
    expect(window.__yaRenderCalls).toEqual([])
    expect(window.__yaDestroyCalls).toEqual([])
  })

  describe('ad blocker fallback', () => {
    beforeEach(() => {
      jest.useFakeTimers()
    })

    afterEach(() => {
      act(() => {
        jest.runOnlyPendingTimers()
      })
      jest.useRealTimers()
    })

    it('does not show the fallback while Yandex SDK is available', () => {
      render(<MentorsListAd id="my-slot" blockId="R-X-1" blockDetectionTimeoutMs={3000} />)
      act(() => {
        jest.advanceTimersByTime(3500)
      })
      expect(screen.queryByTestId('mentors-list-ad-fallback')).not.toBeInTheDocument()
    })

    it('shows the fallback message when the Yandex SDK fails to load', () => {
      delete window.Ya
      window.yaContextCb = []

      render(<MentorsListAd id="my-slot" blockId="R-X-1" blockDetectionTimeoutMs={3000} />)
      expect(screen.queryByTestId('mentors-list-ad-fallback')).not.toBeInTheDocument()

      act(() => {
        jest.advanceTimersByTime(3500)
      })

      expect(screen.getByTestId('mentors-list-ad-fallback')).toBeInTheDocument()
      expect(
        screen.getByText('Здесь должен был быть рекламный блок, но его заблокировали')
      ).toBeInTheDocument()
    })

    it('hides the fallback if the SDK loads later than the timeout', () => {
      delete window.Ya
      window.yaContextCb = []

      render(<MentorsListAd id="my-slot" blockId="R-X-1" blockDetectionTimeoutMs={3000} />)
      act(() => {
        jest.advanceTimersByTime(3500)
      })
      expect(screen.getByTestId('mentors-list-ad-fallback')).toBeInTheDocument()

      // Yandex SDK finally arrives and drains the queue.
      const renderCalls: RenderCall[] = []
      const destroyCalls: RenderCall[] = []
      window.__yaRenderCalls = renderCalls
      window.__yaDestroyCalls = destroyCalls
      window.Ya = {
        Context: {
          AdvManager: {
            render: (opts) => renderCalls.push(opts),
            destroy: (opts) => destroyCalls.push(opts),
          },
        },
      }
      const queued = window.yaContextCb as Array<() => void>
      act(() => {
        queued.forEach((cb) => cb())
      })

      expect(screen.queryByTestId('mentors-list-ad-fallback')).not.toBeInTheDocument()
      expect(renderCalls).toHaveLength(1)
    })

    it('does not show the fallback before the timeout elapses', () => {
      delete window.Ya
      window.yaContextCb = []

      render(<MentorsListAd id="my-slot" blockId="R-X-1" blockDetectionTimeoutMs={3000} />)
      act(() => {
        jest.advanceTimersByTime(2000)
      })
      expect(screen.queryByTestId('mentors-list-ad-fallback')).not.toBeInTheDocument()
    })

    it('keeps the slot div in the DOM even when fallback is visible', () => {
      delete window.Ya
      window.yaContextCb = []

      const { container } = render(
        <MentorsListAd id="my-slot" blockId="R-X-1" blockDetectionTimeoutMs={3000} />
      )
      act(() => {
        jest.advanceTimersByTime(3500)
      })
      // Slot must remain so a delayed SDK can still inject the iframe.
      expect(container.querySelector('#my-slot')).not.toBeNull()
    })
  })

  it('picks up a block id set after mount but before SDK loads', () => {
    // Simulate GTM firing after React mount but before Yandex SDK is ready:
    // start with a plain queue array, mount the component, then have GTM
    // set the block id, then have the SDK consume the queue.
    window.yaContextCb = []
    delete window.Ya

    render(<MentorsListAd id="my-slot" />)
    expect(window.yaContextCb).toHaveLength(1)

    // GTM fires — sets the block id.
    window.getmentorAds = { mentorsListBlockId: 'R-LATE-1' }

    // Yandex SDK loads — install Ya and drain the queue (as Yandex does).
    const renderCalls: RenderCall[] = []
    const destroyCalls: RenderCall[] = []
    window.__yaRenderCalls = renderCalls
    window.__yaDestroyCalls = destroyCalls
    window.Ya = {
      Context: {
        AdvManager: {
          render: (opts) => renderCalls.push(opts),
          destroy: (opts) => destroyCalls.push(opts),
        },
      },
    }
    const queued = window.yaContextCb as Array<() => void>
    queued.forEach((cb) => cb())

    expect(renderCalls).toEqual([{ blockId: 'R-LATE-1', renderTo: 'my-slot' }])
  })
})
