import type {
  GetServerSideProps,
  GetServerSidePropsContext,
  GetServerSidePropsResult,
  GetStaticProps,
  GetStaticPropsContext,
  GetStaticPropsResult,
} from 'next'
import { pageViews, serverSideRenderDuration, mentorProfileViews } from './metrics'
import { logError } from './logger'

type SSRStatus = 'success' | 'redirect' | 'not_found' | 'error'

interface SSRResult<P> {
  props?: P
  redirect?: {
    destination: string
    permanent?: boolean
    statusCode?: number
  }
  notFound?: boolean
}

/**
 * Wraps getServerSideProps with observability instrumentation
 */
export function withSSRObservability<P extends { [key: string]: unknown }>(
  getServerSidePropsFunc: GetServerSideProps<P>,
  pageName: string
): GetServerSideProps<P> {
  return async (context: GetServerSidePropsContext): Promise<GetServerSidePropsResult<P>> => {
    const start = Date.now()
    let status: SSRStatus = 'success'

    // Track page view
    pageViews.inc({ page: pageName })

    try {
      // Call the original function
      const result = (await getServerSidePropsFunc(context)) as SSRResult<P>

      // Check if it's a redirect or notFound
      if (result.redirect) {
        status = 'redirect'
      } else if (result.notFound) {
        status = 'not_found'
      }

      // Track mentor profile views if this is a mentor page
      if (pageName === 'mentor-detail' && context.params?.slug && status === 'success') {
        mentorProfileViews.inc()
      }

      const duration = (Date.now() - start) / 1000
      serverSideRenderDuration.observe({ page: pageName, status }, duration)

      return result as GetServerSidePropsResult<P>
    } catch (error) {
      status = 'error'
      const duration = (Date.now() - start) / 1000
      serverSideRenderDuration.observe({ page: pageName, status }, duration)

      if (error instanceof Error) {
        logError(error, {
          page: pageName,
          url: context.resolvedUrl,
          params: context.params,
        })
      }

      throw error
    }
  }
}

/**
 * Simpler version for static props (if needed)
 */
export function withStaticPropsObservability<P extends { [key: string]: unknown }>(
  getStaticPropsFunc: GetStaticProps<P>,
  pageName: string
): GetStaticProps<P> {
  return async (context: GetStaticPropsContext): Promise<GetStaticPropsResult<P>> => {
    const start = Date.now()
    let status: SSRStatus = 'success'

    try {
      const result = (await getStaticPropsFunc(context)) as SSRResult<P>

      if (result.redirect) {
        status = 'redirect'
      } else if (result.notFound) {
        status = 'not_found'
      }

      const duration = (Date.now() - start) / 1000
      serverSideRenderDuration.observe({ page: pageName, status }, duration)

      return result as GetStaticPropsResult<P>
    } catch (error) {
      status = 'error'
      const duration = (Date.now() - start) / 1000
      serverSideRenderDuration.observe({ page: pageName, status }, duration)

      if (error instanceof Error) {
        logError(error, {
          page: pageName,
          params: context.params,
        })
      }

      throw error
    }
  }
}
