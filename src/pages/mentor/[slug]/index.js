import { useEffect } from 'react'
import classNames from 'classnames'
import Link from 'next/link'
import Head from 'next/head'
import NavHeader from '../../../components/NavHeader'
import Footer from '../../../components/Footer'
import { getOneMentorBySlug } from '../../../server/mentors-data'
import Section from '../../../components/Section'
import { Markup } from 'interweave'
import MetaHeader from '../../../components/MetaHeader'
import seo from '../../../config/seo'
import allFilters from '../../../config/filters'
import analytics from '../../../lib/analytics'
import { htmlContent } from '../../../lib/html-content'
import { polyfill } from 'interweave-ssr'
import pluralize from '../../../lib/pluralize'
import { imageLoader } from '../../../lib/azure-image-loader'
import { withSSRObservability } from '../../../lib/with-ssr-observability'
import logger from '../../../lib/logger'

// This enables rendering profile HTML on server
polyfill()

async function _getServerSideProps(context) {
  const mentor = await getOneMentorBySlug(context.params.slug)

  if (!mentor) {
    logger.warn('Mentor not found', { slug: context.params.slug })
    return {
      notFound: true,
    }
  }

  logger.info('Mentor profile page rendered', {
    mentorId: mentor.id,
    mentorSlug: mentor.slug,
    mentorName: mentor.name,
  })

  return {
    props: {
      mentor,
    },
  }
}

export const getServerSideProps = withSSRObservability(_getServerSideProps, 'mentor-detail')

export default function Mentor(props) {
  const mentor = props.mentor
  const title = mentor.name + ' | ' + seo.title

  useEffect(() => {
    analytics.event('View Mentor Page', {
      'Mentor Id': mentor.id,
      'Mentor Name': mentor.name,
      'Mentor Experience': mentor.experience,
      'Mentor Price': mentor.price,
      'Mentor Sponsors': mentor.sponsors,
      'Mentee Count': mentor.menteeCount,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Intentionally run once on mount - analytics tracking

  return (
    <>
      <Head>
        <title>{title}</title>

        <MetaHeader
          customTitle={mentor.name}
          customDescription={mentor.job + ' @ ' + mentor.workplace}
          customImage={mentor.photo_url}
        />
      </Head>

      <NavHeader className="bg-primary-100" />

      <Section id="body">
        <div className="flex">
          <div className="flex-1">
            <h1 className="mb-2">{mentor.name}</h1>
            <div className="mb-3">
              {mentor.job} @ {mentor.workplace}
            </div>

            <div className="flex flex-wrap -m-1 mb-5">
              {mentor.tags.map((tag) => (
                <div
                  key={tag}
                  // className="border-2 border-gray-700 rounded-full py-1 px-4 m-2"
                  className={classNames('text-sm text-gray-600 rounded-full py-1 px-4 m-1', {
                    'bg-gray-300': allFilters.tags.includes(tag),
                    'bg-indigo-200': allFilters.sponsors.includes(tag),
                  })}
                >
                  {tag}
                </div>
              ))}
            </div>

            <div className="mb-4 md:hidden">
              <img
                className="w-full"
                src={imageLoader({ src: mentor.slug, quality: 'full' })}
                alt={mentor.name}
              />
            </div>

            {!mentor.isVisible && (
              <div className="text-gray-500 mb-6">Ментор временно приостановил приём заявок.</div>
            )}

            <div className="mb-4">
              <b>Опыт:</b> {mentor.experience} лет
              <br />
              <b>Цена (за час):</b> {mentor.price}
              <br />
              {mentor.menteeCount > 0 && (
                <>
                  <b>
                    {pluralize(mentor.menteeCount, [
                      'Получил помощь: ',
                      'Получили помощь: ',
                      'Получили помощь: ',
                    ])}
                  </b>
                  {mentor.menteeCount}
                  {pluralize(mentor.menteeCount, [' человек', ' человека', ' человек'])}
                  <br />
                </>
              )}
            </div>

            {mentor.isVisible && (
              <div className="mb-6">
                <Link href={'/mentor/' + mentor.slug + '/contact'} className="button">
                  Оставить заявку
                </Link>
              </div>
            )}

            {mentor.about && (
              <div className="prose my-4">
                <b>О себе</b>
                <Markup
                  content={htmlContent(mentor.about)}
                  noWrap={true}
                  disableLineBreaks={true}
                />
              </div>
            )}

            {mentor.description && (
              <div className="prose my-4">
                <b>С чем помогу</b>
                <Markup
                  content={htmlContent(mentor.description)}
                  noWrap={true}
                  disableLineBreaks={true}
                />
              </div>
            )}

            {mentor.competencies && (
              <div className="prose my-4">
                <b>Компетенции</b>
                <br />
                <i>{mentor.competencies}</i>
              </div>
            )}
          </div>

          <div className="flex-1 pl-4 hidden md:block">
            <img src={imageLoader({ src: mentor.slug, quality: 'large' })} alt={mentor.name} />
          </div>
        </div>
      </Section>

      <Footer />
    </>
  )
}
