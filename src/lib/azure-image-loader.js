import getAllMentors from '../assets-stub/datas.js'

const TEST = process.env.NEXT_PUBLIC_TESTING_MODE

export function imageLoader({ src, width, quality }) {
  if (TEST === 'on') {
    const mentors = getAllMentors
    const mentor = mentors.find((el) => el.slug === src)
    return mentor.photo_url
  }

  const STORAGE_DOMAIN = process.env.NEXT_PUBLIC_AZURE_STORAGE_DOMAIN

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
