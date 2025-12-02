const STORAGE_DOMAIN =
  process.env.NEXT_PUBLIC_CDN_ENDPOINT ||
  process.env.NEXT_PUBLIC_YANDEX_STORAGE_ENDPOINT ||
  process.env.NEXT_PUBLIC_AZURE_STORAGE_DOMAIN

const STORAGE_BUCKET = process.env.NEXT_PUBLIC_YANDEX_STORAGE_BUCKET || 'mentor-images'

export function imageLoader({ src, width, quality }) {
  const url =
    'https://' + STORAGE_DOMAIN + (process.env.NEXT_PUBLIC_CDN_ENDPOINT ? '' : '/' + STORAGE_BUCKET)

  let size = 'full'
  if (width && width <= 900) {
    size = 'large'
  } else if (width && width <= 36) {
    size = 'small'
  }

  if (quality === 'full' || quality === 'large' || quality === 'small') {
    size = quality
  }

  return `${url}/${src}/${size}`
}
