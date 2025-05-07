import Head from 'next/head'
import { getAllMentors } from '../server/mentors-data'
import seo from '../config/seo'
import { imageLoader } from '../lib/azure-image-loader'

export async function getServerSideProps(context) {
  if (context?.query?.ai_secret !== process.env.MENTORS_API_LIST_AUTH_TOKEN_AIKB) {
    return { props: {} }
  } else {
    const pageMentors = await getAllMentors({ onlyVisible: true })

    return {
      props: {
        pageMentors,
      },
    }
  }
}

export default function MentorsAIKB({ pageMentors }) {
  return (
    <>
      <Head>
        <title>{seo.title}</title>
      </Head>

      {pageMentors.map((mentor) => (
        <p key={mentor.id}>
          <h2>{mentor.name}</h2>
          <p>
            {mentor.job} @ {mentor.workplace}
          </p>
          <p>
            Описание: <br />
            <pre>{mentor.about}</pre>
          </p>
          <p>
            Чем помогу: <br />
            <pre>{mentor.description}</pre>
          </p>
          <p>Компетенции: {mentor.competencies}</p>
          <p>Теги: {mentor.tags}</p>
          <p>Опыт: {mentor.experience}</p>
          <p>Цена: {mentor.price}</p>
          <p>Помог людям: {mentor.menteeCount}</p>
          <p>Новый на сайте: {mentor.isNew}</p>
          <p>Фото: {imageLoader({ src: mentor.slug, quality: 'large' })}</p>
          <p>
            Ссылка на профиль: {seo.domain}/mentor/{mentor.slug}
          </p>
        </p>
      ))}
    </>
  )
}
