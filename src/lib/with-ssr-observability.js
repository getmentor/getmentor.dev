import { pageViews, serverSideRenderDuration, mentorProfileViews } from './metrics'
import { logError } from './logger'

/**
 * Wraps getServerSideProps with observability instrumentation
 * @param {Function} getServerSidePropsFunc - The original getServerSideProps function
 * @param {string} pageName - Name of the page for metrics (e.g., 'index', 'mentor-detail')
 * @returns {Function} - Wrapped getServerSideProps function
 */
export function withSSRObservability(getServerSidePropsFunc, pageName) {
  return async (context) => {
    const start = Date.now()
    let status = 'success'

    // Track page view
    pageViews.inc({ page: pageName })

    try {
      // Call the original function
      const result = await getServerSidePropsFunc(context)

      // Check if it's a redirect or notFound
      if (result.redirect) {
        status = 'redirect'
      } else if (result.notFound) {
        status = 'not_found'
      }

      // Track mentor profile views if this is a mentor page
      if (pageName === 'mentor-detail' && context.params?.slug && status === 'success') {
        mentorProfileViews.inc({ mentor_slug: context.params.slug })
      }

      const duration = (Date.now() - start) / 1000
      serverSideRenderDuration.observe({ page: pageName, status }, duration)

      return result
    } catch (error) {
      status = 'error'
      const duration = (Date.now() - start) / 1000
      serverSideRenderDuration.observe({ page: pageName, status }, duration)

      logError(error, {
        page: pageName,
        url: context.resolvedUrl,
        params: context.params,
      })

      throw error
    }
  }
}

/**
 * Simpler version for static props (if needed)
 */
export function withStaticPropsObservability(getStaticPropsFunc, pageName) {
  return async (context) => {
    const start = Date.now()
    let status = 'success'

    try {
      const result = await getStaticPropsFunc(context)

      if (result.redirect) {
        status = 'redirect'
      } else if (result.notFound) {
        status = 'not_found'
      }

      const duration = (Date.now() - start) / 1000
      serverSideRenderDuration.observe({ page: pageName, status }, duration)

      return result
    } catch (error) {
      status = 'error'
      const duration = (Date.now() - start) / 1000
      serverSideRenderDuration.observe({ page: pageName, status }, duration)

      logError(error, {
        page: pageName,
        params: context.params,
      })

      throw error
    }
  }
}
