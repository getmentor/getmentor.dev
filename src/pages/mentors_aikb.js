import Head from 'next/head'
import { getAllMentors } from '../server/mentors-data'
import seo from '../config/seo'
import { imageLoader } from '../lib/azure-image-loader'

export async function getServerSideProps(context) {
  // console.log(context.query)
  // if (context?.query?.ai_secret !== process.env.MENTORS_API_LIST_AUTH_TOKEN_AIKB) {
  //   return { props: {} }
  // } else {
  const pageMentors = await getAllMentors({ onlyVisible: true })

  return {
    props: {
      pageMentors,
    },
  }
  // }
}

export default function MentorsAIKB({ pageMentors }) {
  return (
    <>
      <Head>
        <title>{seo.title}</title>
      </Head>

      <table>
        <tr>
          <th>Имя</th>
          <th>Должность и работа</th>
          <th>Описание</th>
          <th>С чем может помочь</th>
          <th>Компетенции</th>
          <th>Теги</th>
          <th>Опыт</th>
          <th>Цена</th>
          <th>Ссылка на фото</th>
          <th>ССылка на профиль</th>
        </tr>
        {pageMentors?.map((mentor) => (
          <tr key={mentor.id}>
            <td>{mentor.name}</td>
            <td>{mentor.job + ' @ ' + mentor.workplace}</td>
            <td>{mentor.about}</td>
            <td>{mentor.description}</td>
            <td>{mentor.competencies}</td>
            <td>{mentor.tags.join(',')}</td>
            <td>{mentor.experience}</td>
            <td>{mentor.price}</td>
            <td>{imageLoader({ src: mentor.slug, quality: 'large' })}</td>
            <td>{seo.domain + '/mentor/' + mentor.slug}</td>
          </tr>
        ))}
      </table>
    </>
  )
}
