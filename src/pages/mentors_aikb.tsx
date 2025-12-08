import Head from 'next/head'
import type { GetServerSideProps, InferGetServerSidePropsType } from 'next'
import { getAllMentors } from '@/server/mentors-data'
import seo from '@/config/seo'
import { imageLoader } from '@/lib/azure-image-loader'
import { withSSRObservability } from '@/lib/with-ssr-observability'
import logger from '@/lib/logger'
import type { MentorListItem } from '@/types'

interface MentorsAIKBProps {
  [key: string]: unknown
  pageMentors: MentorListItem[]
}

const _getServerSideProps: GetServerSideProps<MentorsAIKBProps> = async (_context) => {
  // console.log(context.query)
  // if (context?.query?.ai_secret !== process.env.MENTORS_API_LIST_AUTH_TOKEN_AIKB) {
  //   return { props: {} }
  // } else {
  const pageMentors = await getAllMentors({ onlyVisible: true })

  logger.info('AIKB mentors page rendered', {
    mentorCount: pageMentors.length,
  })

  return {
    props: {
      pageMentors,
    },
  }
  // }
}

export const getServerSideProps = withSSRObservability(_getServerSideProps, 'mentors-aikb')

export default function MentorsAIKB({
  pageMentors,
}: InferGetServerSidePropsType<typeof getServerSideProps>): JSX.Element {
  return (
    <>
      <Head>
        <title>{seo.title}</title>
      </Head>

      <table>
        <thead>
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
        </thead>
        <tbody>
          {pageMentors?.map((mentor) => (
            <tr key={mentor.id}>
              <td>{mentor.name}</td>
              <td>{mentor.job + ' @ ' + mentor.workplace}</td>
              <td>{mentor.about}</td>
              <td>{mentor.description}</td>
              <td>{mentor.competencies}</td>
              <td>{mentor.tags.join(', ')}</td>
              <td>{mentor.experience}</td>
              <td>{mentor.price}</td>
              <td>{imageLoader({ src: mentor.slug, quality: 'large' })}</td>
              <td>{seo.domain + '/mentor/' + mentor.slug}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  )
}
