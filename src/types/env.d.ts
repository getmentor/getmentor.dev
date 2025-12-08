/**
 * Environment variable type declarations
 */

declare namespace NodeJS {
  interface ProcessEnv {
    // Go API
    NEXT_PUBLIC_GO_API_URL?: string
    GO_API_INTERNAL_TOKEN?: string

    // Azure Storage
    AZURE_STORAGE_CONNECTION_STRING?: string
    AZURE_STORAGE_DOMAIN?: string
    AZURE_STORAGE_CONTAINER_NAME?: string
    NEXT_PUBLIC_AZURE_STORAGE_DOMAIN?: string

    // Yandex Storage
    NEXT_PUBLIC_YANDEX_STORAGE_ENDPOINT?: string
    NEXT_PUBLIC_YANDEX_STORAGE_BUCKET?: string

    // CDN
    NEXT_PUBLIC_CDN_ENDPOINT?: string

    // ReCAPTCHA
    NEXT_PUBLIC_RECAPTCHA_V2_SITE_KEY?: string
    RECAPTCHA_V2_SECRET_KEY?: string

    // Auth tokens
    METRICS_AUTH_TOKEN?: string
    MENTORS_API_LIST_AUTH_TOKEN?: string
    REVALIDATE_SECRET_TOKEN?: string

    // Grafana Cloud (optional)
    GRAFANA_CLOUD_METRICS_URL?: string
    GRAFANA_CLOUD_METRICS_USERNAME?: string
    GRAFANA_CLOUD_LOGS_URL?: string
    GRAFANA_CLOUD_LOGS_USERNAME?: string
    GRAFANA_CLOUD_TRACES_URL?: string
    GRAFANA_CLOUD_TRACES_USERNAME?: string
    GRAFANA_CLOUD_API_KEY?: string

    // Logging
    LOG_LEVEL?: 'debug' | 'info' | 'warn' | 'error'
    LOG_DIR?: string

    // Observability
    O11Y_SERVICE_NAME?: string
    NEXT_PUBLIC_O11Y_EXPORTER_ENDPOINT?: string
    NEXT_PUBLIC_O11Y_SERVICE_NAME?: string
    NEXT_PUBLIC_O11Y_SERVICE_NAMESPACE?: string
    NEXT_PUBLIC_SERVICE_VERSION?: string
    NEXT_PUBLIC_APP_ENV?: string
    HOSTNAME?: string

    // Domain
    DOMAIN?: string

    // Node
    NODE_ENV?: 'development' | 'production' | 'test'
  }
}
