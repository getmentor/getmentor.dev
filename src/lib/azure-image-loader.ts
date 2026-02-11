type ImageSize = 'full' | 'large' | 'small'

interface ImageLoaderParams {
  src: string
  width?: number
  quality?: ImageSize | number
}

const STORAGE_DOMAIN =
  process.env.NEXT_PUBLIC_CDN_ENDPOINT ||
  process.env.NEXT_PUBLIC_YANDEX_STORAGE_ENDPOINT ||
  process.env.NEXT_PUBLIC_AZURE_STORAGE_DOMAIN

const STORAGE_BUCKET = process.env.NEXT_PUBLIC_YANDEX_STORAGE_BUCKET || 'mentor-images'

export function imageLoader({ src, width, quality }: ImageLoaderParams): string {
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

  return `${url}/${src}/${size}`
}
