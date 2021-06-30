import seo from '../config/seo'

export default function MetaHeader({ customTitle, customDescription, customImage }) {
  const page_title = customTitle ? customTitle + ' | ' + seo.title : seo.title
  const page_description = customDescription
    ? customDescription + ' | ' + seo.description
    : seo.description
  const page_image = customImage ?? seo.imageUrl

  return (
    <>
      <meta name="description" content={page_description} />

      <meta name="twitter:card" content="summary" />
      <meta name="twitter:title" content={page_title} />
      <meta name="twitter:description" content={page_description} />
      <meta name="twitter:image.src" content={page_image} />

      <meta name="og:site_name" content={seo.domain} />
      <meta name="og:type" content="website" />
      <meta name="og:title" content={page_title} />
      <meta name="og:description" content={page_description} />
      <meta name="og:image" content={page_image} />
    </>
  )
}
