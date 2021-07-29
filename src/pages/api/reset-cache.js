import { forceResetCache } from '../../server/cached-mentors'

export default (req, res) => {
  if (req?.headers?.auth_token === process.env.WEBCACHE_RESET_AUTH_TOKEN) {
    forceResetCache()
    res.status(200).json({})
  } else {
    res.status(403).json({})
  }
}
