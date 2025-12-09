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
