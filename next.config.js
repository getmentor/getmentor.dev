module.exports = {
  // Enable standalone output for Docker deployments
  output: 'standalone',

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: process.env.NEXT_PUBLIC_AZURE_STORAGE_DOMAIN,
        port: '',
        pathname: '/mentor-images/**',
      },
      {
        protocol: 'https',
        hostname: process.env.NEXT_PUBLIC_YANDEX_STORAGE_ENDPOINT,
        port: '',
        pathname: `/${process.env.NEXT_PUBLIC_YANDEX_STORAGE_BUCKET}/**`,
      },
      {
        protocol: 'https',
        hostname: process.env.NEXT_PUBLIC_CDN_ENDPOINT,
        port: '',
        pathname: `/**`,
      },
    ],
  },

  experimental: {
    largePageDataBytes: 10 * 1024 * 1024,
  },

  // Next.js 16 way to exclude server-side packages from bundling
  // These packages use Node.js built-ins and should be loaded at runtime
  serverExternalPackages: [
    // OpenTelemetry packages
    '@opentelemetry/sdk-node',
    '@opentelemetry/auto-instrumentations-node',
    '@opentelemetry/exporter-trace-otlp-http',
    '@opentelemetry/resources',
    // Prometheus metrics
    'prom-client',
    // Winston logger
    'winston',
  ],

  // Enable Turbopack (Next.js 16 default)
  turbopack: {},

  async headers() {
    const headers = [
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

    // Only add security headers in production
    if (process.env.NODE_ENV === 'production') {
      headers.push({
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
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://getmentor.dev https://ru.getmentor.dev https://cdn.mxpnl.com https://www.google.com https://www.gstatic.com https://www.googletagmanager.com https://www.google-analytics.com https://mc.yandex.ru https://mc.yandex.com https://decide.mixpanel.com ; " +
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
              "img-src 'self' https: data:; " +
              "font-src 'self' data: https://fonts.gstatic.com https://at.alicdn.com; " +
              "connect-src 'self' https://api.mixpanel.com https://decide.mixpanel.com https://getmentor.dev https://xn--c1aea1aggold.xn--p1ai https://ru.getmentor.dev https://mc.yandex.ru https://mc.yandex.com https://www.google-analytics.com https://region1.analytics.google.com https://stats.g.doubleclick.net https://google.com https://www.google.com; " +
              'frame-src https://www.google.com https://calendly.com https://koalendar.com https://calendlab.ru https://airtable.com; ' +
              "object-src 'none'; " +
              "base-uri 'self'; " +
              "form-action 'self'; " +
              'upgrade-insecure-requests;',
          },
        ],
      })
    }

    return headers
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
