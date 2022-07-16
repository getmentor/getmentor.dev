export default {
  BASE_URL: {
    development: 'http://localhost:3000/',
    production: 'https://getmentor.dev/',
  }[process.env.NODE_ENV],

  CACHE_REFRESH_INTERVAL: 1 * 60 * 1000,
}
