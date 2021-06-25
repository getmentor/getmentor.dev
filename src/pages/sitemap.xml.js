import { getMentors } from '../server/cached-mentors'

const Sitemap = () => {}

const baseUrl = {
  development: 'http://localhost:3000/',
  production: 'https://getmentor.dev/',
}[process.env.NODE_ENV]

function sitemapItem(path) {
  return `
        <url>
        <loc>${baseUrl + path}</loc>
        <lastmod>${new Date().toISOString()}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>0.5</priority>
        </url>
    `
}

export async function getServerSideProps({ res }) {
  const allMentors = await getMentors()

  let staticPages = [{ page: '' }, { page: 'bementor' }, { page: 'donate' }]

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
        <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
        ${staticPages.map((s) => sitemapItem(s.page)).join('')}
        ${allMentors.map((m) => sitemapItem('mentor/' + m.slug)).join('')}
        </urlset>
    `

  res.setHeader('Content-Type', 'text/xml')
  res.write(sitemap)
  res.end()

  return {
    props: {},
  }
}

export default Sitemap
