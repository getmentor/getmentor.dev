module.exports = {
  // Enable standalone output for Docker deployments
  output: 'standalone',

  images: {
    remotePatterns: [
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
    instrumentationHook: true,
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
      // SECURITY: Comprehensive security headers for all pages
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
          },
          {
            key: 'Content-Security-Policy',
            value:
              "default-src 'self'; " +
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.mxpnl.com https://www.google.com https://www.gstatic.com https://decide.mixpanel.com; " +
              "style-src 'self' 'unsafe-inline'; " +
              "img-src 'self' https: data:; " +
              "font-src 'self' data:; " +
              "connect-src 'self' https://api.mixpanel.com https://decide.mixpanel.com https://getmentor.dev; " +
              "frame-src https://www.google.com; " +
              "object-src 'none'; " +
              "base-uri 'self'; " +
              "form-action 'self'; " +
              "upgrade-insecure-requests;",
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
    ]
  },

  onDemandEntries: {
    // period (in ms) where the server will keep pages in the buffer
    maxInactiveAge: 60 * 60 * 1000,
    // number of pages that should be kept simultaneously without being disposed
    pagesBufferLength: 20,
  },
}
