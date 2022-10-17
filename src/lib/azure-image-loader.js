const STORAGE_DOMAIN = process.env.NEXT_PUBLIC_AZURE_STORAGE_DOMAIN

export function imageLoader({ src, width, quality }) {
  const url = 'https://' + STORAGE_DOMAIN + '/mentor-images/'

  let size = 'full'
  if (width && width <= 900) {
    size = 'large'
  } else if (width && width <= 36) {
    size = 'small'
  }

  if (quality === 'full' || quality === 'large' || quality === 'small') {
    size = quality
  }

  return `${url}${src}/${size}`
}
