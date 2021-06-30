import seo from '../config/seo'

export default function MetaHeader({ customTitle, customDescription, customImage }) {
  const title = customTitle ? customTitle + ' | ' + seo.title : seo.title
  const description = customDescription
    ? customDescription + ' | ' + seo.description
    : seo.description
  const image = customImage ?? seo.imageUrl

  return (
    <>
      <title>{title}</title>

      <meta name="description" content={description} />

      <meta name="twitter:card" content="summary" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image.src" content={image} />

      <meta name="og:site_name" content={seo.domain} />
      <meta name="og:type" content="website" />
      <meta name="og:title" content={title} />
      <meta name="og:description" content={description} />
      <meta name="og:image" content={image} />
    </>
  )
}
