/**
 * Global type augmentations
 */

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

/**
 * Module declarations for packages without types
 */
declare module 'object-hash' {
  function hash(object: unknown, options?: unknown): string
  export default hash
}

declare module 'react-gtm-module' {
  interface TagManagerArgs {
    gtmId: string
    dataLayer?: Record<string, unknown>
    dataLayerName?: string
    events?: Record<string, unknown>
    auth?: string
    preview?: string
  }

  const TagManager: {
    initialize: (args: TagManagerArgs) => void
    dataLayer: (args: { dataLayer: Record<string, unknown> }) => void
  }

  export default TagManager
}
