import { getAllMentors } from '../server/mentors-data'
import constants from '../config/constants'

const Sitemap = () => {}

const baseUrl = constants.BASE_URL

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
  const allMentors = await getAllMentors({ onlyVisible: true })

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
