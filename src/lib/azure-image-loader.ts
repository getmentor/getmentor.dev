type ImageSize = 'full' | 'large' | 'small'

interface ImageLoaderParams {
  src: string
  width?: number
  quality?: ImageSize | number
  version?: string | number
}

const STORAGE_DOMAIN =
  process.env.NEXT_PUBLIC_CDN_ENDPOINT ||
  process.env.NEXT_PUBLIC_YANDEX_STORAGE_ENDPOINT ||
  process.env.NEXT_PUBLIC_AZURE_STORAGE_DOMAIN

const STORAGE_BUCKET = process.env.NEXT_PUBLIC_YANDEX_STORAGE_BUCKET || 'mentor-images'

export function imageLoader({ src, width, quality, version }: ImageLoaderParams): string {
  const url =
    'https://' + STORAGE_DOMAIN + (process.env.NEXT_PUBLIC_CDN_ENDPOINT ? '' : '/' + STORAGE_BUCKET)

  let size: ImageSize = 'full'
  if (width && width <= 36) {
    size = 'small'
  } else if (width && width <= 900) {
    size = 'large'
  }

  if (quality === 'full' || quality === 'large' || quality === 'small') {
    size = quality
  }

  const baseUrl = `${url}/${src}/${size}`
  return version !== undefined ? `${baseUrl}?v=${version}` : baseUrl
}

export function updatedAtToVersion(updatedAt: string | undefined): number | undefined {
  if (!updatedAt) return undefined
  const ms = new Date(updatedAt).getTime()
  return isNaN(ms) ? undefined : Math.floor(ms / 1000)
}
