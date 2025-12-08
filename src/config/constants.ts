interface ConstantsConfig {
  BASE_URL: string | undefined
  CACHE_REFRESH_INTERVAL: number
}

const constants: ConstantsConfig = {
  BASE_URL:
    process.env.NODE_ENV === 'production'
      ? `https://${process.env.DOMAIN}/`
      : 'http://localhost:3000/',
  CACHE_REFRESH_INTERVAL: 1 * 60 * 1000,
}

export default constants
