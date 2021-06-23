export default {
  url(image, params) {
    let version = 'v1'
    let transform = []

    if (params.version) {
      version = 'v' + params.version
    }
    if (params.width) {
      transform.push('w_' + params.width)
    }
    if (params.blur) {
      transform.push('e_blur:' + params.blur)
    }

    return (
      'https://res.cloudinary.com/getmentor-dev/image/upload/' +
      transform.join(',') +
      '/' +
      version +
      '/' +
      image
    )
  },
}
