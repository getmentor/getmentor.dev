import { getMentors } from '../server/cached-mentors'

const baseUrl = {
  development: 'http://localhost:3000/',
  production: 'https://getmentor.dev/',
}[process.env.NODE_ENV]

function sitemapItem(slug) {
  return `
    <url>
      <loc>${baseUrl + slug}</loc>
      <lastmod>${new Date().toISOString()}</lastmod>
      <changefreq>weekly</changefreq>
      <priority>0.5</priority>
    </url>
  `
}

export async function getServerSideProps({ res }) {
  const allMentors = await getMentors()

  let staticPages = [{ slug: '' }, { slug: 'bementor' }, { slug: 'donate' }]

  const sitemap = `
    <?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      ${staticPages.map((s) => sitemapItem(s.slug)).join('')}
      ${allMentors.map((m) => sitemapItem(m.slug)).join('')}
    </urlset>
  `

  res.setHeader('Content-Type', 'text/xml')
  res.write(sitemap)
  res.end()

  return {
    props: {},
  }
}

export default function Sitemap() {
  return <></>
}
