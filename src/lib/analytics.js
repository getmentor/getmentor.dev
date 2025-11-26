export default {
  event(name, params) {
    if (typeof window !== 'undefined') {
      window?.amplitude?.getInstance().logEvent(name, params)
      window?.mixpanel?.track(name, params)
    }
  },
}
