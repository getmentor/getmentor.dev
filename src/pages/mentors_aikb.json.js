import { getAllMentors } from '../server/mentors-data'
import seo from '../config/seo'
import { imageLoader } from '../lib/azure-image-loader'

const Mentors_aikb = () => {}

export async function getServerSideProps({ res, query }) {
  if (query?.ai_secret !== process.env.MENTORS_API_LIST_AUTH_TOKEN_AIKB) {
    res.write('{}')
    res.end()
  } else {
    const allMentors = await getAllMentors({ onlyVisible: true })

    const mentors = allMentors.map((m) => {
      return {
        id: m.id,
        name: m.name,
        title: m.job,
        workplace: m.workplace,
        about: m.about,
        description: m.description,
        competencies: m.competencies,
        experience: m.experience,
        price: m.price,
        doneSessions: m.menteeCount,
        photo: imageLoader({ src: m.slug, quality: 'small' }),
        tags: m.tags.join(','),
        link: `${seo.domain}/mentor/${m.slug}`,
      }
    })

    res.setHeader('Content-Type', 'application/json')
    res.write(JSON.stringify({ mentors: mentors }))
    res.end()
  }

  return {
    props: {},
  }
}

export default Mentors_aikb
