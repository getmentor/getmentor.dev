//const STORAGE_DOMAIN = process.env.NEXT_PUBLIC_AZURE_STORAGE_DOMAIN

import getAllMentors from '../assets-plug/datas.js'

export function imageLoader({ src, width, quality }) {
  const mentors = getAllMentors
  const mentor = mentors.find((el) => el.name === src)
  return mentor.photo_url
  /*
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

  return `${url}${src}/${size}` */
}
