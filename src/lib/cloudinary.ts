export interface CloudinaryParams {
  version?: number | string
  width?: number
  blur?: number
}

interface Cloudinary {
  url: (image: string, params: CloudinaryParams) => string
}

const cloudinary: Cloudinary = {
  url(image: string, params: CloudinaryParams): string {
    let version = 'v1'
    const transform: string[] = []

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

export default cloudinary
