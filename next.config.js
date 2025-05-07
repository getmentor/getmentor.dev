module.exports = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'dl.airtable.com',
        port: '',
      },
      {
        protocol: 'https',
        hostname: process.env.AZURE_STORAGE_DOMAIN,
        port: '',
        pathname: '/mentor-images/**',
      },
    ],
  },

  experimental: {
    largePageDataBytes: 10 * 1024 * 1024,
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

      // proxy redirects for Mixpanel
      {
        source: '/mxp/lib.min.js',
        destination: 'https://cdn.mxpnl.com/libs/mixpanel-2-latest.min.js',
        permanent: true,
        basePath: false,
      },
      {
        source: '/mxp/lib.js',
        destination: 'https://cdn.mxpnl.com/libs/mixpanel-2-latest.js',
        permanent: true,
        basePath: false,
      },
      {
        source: '/mxp/decide',
        destination: 'https://decide.mixpanel.com/decide',
        permanent: true,
        basePath: false,
      },
      {
        source: '/mxp',
        destination: 'https://api.mixpanel.com/',
        permanent: true,
        basePath: false,
      },
      {
        source: '/aikb',
        destination: '/api/mentors',
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
