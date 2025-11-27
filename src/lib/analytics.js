export default {
  event(name, params) {
    if (typeof window !== 'undefined') {
      window?.mixpanel?.track(name, params)
    }
  },
}
