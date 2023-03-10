/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  /* настройки */
}

module.exports = nextConfig

/*
const { withSentryConfig } = require('@sentry/nextjs')

const moduleExports = {
  sentry: {
    disableServerWebpackPlugin: process.env.BUILD_ON_GITHUB === '1',
    disableClientWebpackPlugin: process.env.BUILD_ON_GITHUB === '1',
    hideSourceMaps: true,
  },

  images: {
    domains: ['dl.airtable.com', process.env.AZURE_STORAGE_DOMAIN],
  },

  experimental: {
    largePageDataBytes: 3 * 1024 * 1024,
  },

  async headers() {
    return [
      // this header fixed bad behaviors of next <Image /> component
      // now local images from /images directory will be cached for 1 day
      // otherwise cache image will regenerate every 60 seconds
      {
        source: '/images/(.*)',
        headers: [
          {
            key: 'cache-control',
            value: 'public, max-age=86400, must-revalidate',
          },
        ],
      },
    ]
  },

  async redirects() {
    return [
      {
        source: '/:slug([a-z-]+\\d+)',
        destination: '/mentor/:slug', // Matched parameters can be used in the destination
        permanent: true,
      },

      {
        source: '/api/internal/mentors/by_id/:id',
        destination: '/api/internal/mentors?id=:id',
        permanent: true,
      },

      {
        source: '/api/internal/mentors/by_slug/:slug',
        destination: '/api/internal/mentors?slug=:slug',
        permanent: true,
      },

      {
        source: '/api/internal/mentors/by_rec/:rec',
        destination: '/api/internal/mentors?rec=:rec',
        permanent: true,
      },

      {
        source: '/api/internal/force_reset_cache',
        destination: '/api/internal/mentors?force_reset_cache=1',
        permanent: true,
      },
    ]
  },

  onDemandEntries: {
    // period (in ms) where the server will keep pages in the buffer
    maxInactiveAge: 60 * 60 * 1000,
    // number of pages that should be kept simultaneously without being disposed
    pagesBufferLength: 20,
  },
}

const SentryWebpackPluginOptions = {
  // Additional config options for the Sentry Webpack plugin. Keep in mind that
  // the following options are set automatically, and overriding them is not
  // recommended:
  //   release, url, org, project, authToken, configFile, stripPrefix,
  //   urlPrefix, include, ignore

  silent: true, // Suppresses all logs
  // For all available options, see:
  // https://github.com/getsentry/sentry-webpack-plugin#options.
}

// Make sure adding Sentry options is the last code to run before exporting, to
// ensure that your source maps include changes from all other Webpack plugins
module.exports = withSentryConfig(moduleExports, SentryWebpackPluginOptions)
*/
