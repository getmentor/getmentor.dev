interface Analytics {
  event: (name: string, params?: Record<string, unknown>) => void
}

const analytics: Analytics = {
  event(name: string, params?: Record<string, unknown>): void {
    if (typeof window !== 'undefined') {
      window?.mixpanel?.track(name, params)
    }
  },
}

export default analytics
