import type { JSX as ReactJSX } from 'react'

declare global {
  namespace JSX {
    // Ensure JSX namespace is available under moduleResolution bundler
    export type Element = ReactJSX.Element
    export type IntrinsicElements = ReactJSX.IntrinsicElements
    export type IntrinsicAttributes = ReactJSX.IntrinsicAttributes
  }

  /**
   * Window interface augmentation for analytics
   */
  interface Window {
    mixpanel?: {
      track: (name: string, params?: Record<string, unknown>) => void
      init: (token: string, config?: Record<string, unknown>) => void
      identify: (id: string) => void
      people?: {
        set: (props: Record<string, unknown>) => void
      }
    }
    dataLayer?: unknown[]
  }
}

/**
 * Module declarations for packages without types
 */
declare module 'object-hash' {
  function hash(object: unknown, options?: unknown): string
  export default hash
}
