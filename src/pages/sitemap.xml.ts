import type { GetServerSideProps } from 'next'
import { getAllMentors } from '@/server/mentors-data'
import constants from '@/config/constants'

const baseUrl = constants.BASE_URL

function sitemapItem(path: string): string {
  return `
        <url>
        <loc>${baseUrl + path}</loc>
        <lastmod>${new Date().toISOString()}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>0.5</priority>
        </url>
    `
}

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  const allMentors = await getAllMentors({ onlyVisible: true })

  const staticPages = [{ page: '' }, { page: 'bementor' }, { page: 'donate' }]

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

export default function Sitemap(): null {
  return null
}
