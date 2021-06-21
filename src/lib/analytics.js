export default {
  event(name, params) {
    if (process.browser) {
      window?.amplitude?.getInstance().logEvent(name, params)
      window?.mixpanel?.track(name, params)
    }
  },
}
