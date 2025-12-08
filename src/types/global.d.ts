/// <reference types="react" />
import type { JSX as ReactJSX } from 'react'

declare global {
  namespace JSX {
    // Ensure JSX namespace is available under moduleResolution bundler
    export type Element = ReactJSX.Element
    export interface IntrinsicElements extends ReactJSX.IntrinsicElements {}
    export interface IntrinsicAttributes extends ReactJSX.IntrinsicAttributes {}
  }
}

/**
 * Global type augmentations
 */

declare global {
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

declare module 'react-google-recaptcha' {
  import * as React from 'react'

  export interface ReCAPTCHAProps {
    sitekey: string
    onChange?: (token: string | null) => void
    size?: 'compact' | 'normal' | 'invisible'
    theme?: 'light' | 'dark'
    type?: 'image' | 'audio'
    tabindex?: number
    hl?: string
  }

  export default class ReCAPTCHA extends React.Component<ReCAPTCHAProps> {
    reset(): void
    execute(): Promise<string | null>
  }
}
