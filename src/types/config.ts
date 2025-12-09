/**
 * Configuration types
 */

/**
 * SEO configuration
 */
export interface SEOConfig {
  title: string
  description: string
  imageUrl: string
  domain: string
}

/**
 * Donate item configuration
 */
export interface DonateItem {
  name: string
  description: string
  linkUrl: string
  image: {
    url: string
    width: number
    height: number
  }
}

/**
 * Logger configuration
 */
export interface LoggerConfig {
  MAX_FILE_SIZE: string
  MAX_FILES: string
  DATE_PATTERN: string
}

/**
 * HTTP client configuration
 */
export interface HttpConfig {
  TIMEOUT_MS: number
}

/**
 * Constants configuration
 */
export interface ConstantsConfig {
  METRICS_DEFAULT_LABELS: {
    service: string
    environment: string
    hostname: string
  }
}
