import { useEffect } from 'react'
import classNames from 'classnames'
import Link from 'next/link'
import Head from 'next/head'
import NavHeader from '../../../components/NavHeader'
import Footer from '../../../components/Footer'
import { getMentors } from '../../../server/cached-mentors'
import Section from '../../../components/Section'
import { Markup } from 'interweave'
import MetaHeader from '../../../components/MetaHeader'
import seo from '../../../config/seo'
import allFilters from '../../../config/filters'
import analytics from '../../../lib/analytics'
import { htmlContent } from '../../../lib/html-content'
import { polyfill } from 'interweave-ssr'
import pluralize from '../../../lib/pluralize'

// This enables rendering profile HTML on server
polyfill()

export async function getServerSideProps(context) {
  const allMentors = await getMentors()
  const mentor = allMentors.find((mentor) => mentor.slug === context.params.slug)

  if (!mentor) {
    return {
      notFound: true,
    }
  }

  return {
    props: {
      mentor,
    },
  }
}

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

      // legacy props
      id: mentor.airtableId,
      name: mentor.name,
      experience: mentor.experience,
      price: mentor.price,
      menteeCount: mentor.menteeCount,
    })
  }, [])

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
              <img className="w-full" src={mentor.photo_url} />
            </div>

            {!mentor.isVisible && (
              <div className="text-gray-500 mb-6">???????????? ???????????????? ???????????????????????? ?????????? ????????????.</div>
            )}

            <div className="mb-4">
              <b>????????:</b> {mentor.experience} ??????
              <br />
              <b>???????? (???? ??????):</b> {mentor.price}
              <br />
              {mentor.menteeCount > 0 && (
                <>
                  <b>
                    {pluralize(mentor.menteeCount, [
                      '?????????????? ????????????: ',
                      '???????????????? ????????????: ',
                      '???????????????? ????????????: ',
                    ])}
                  </b>
                  {mentor.menteeCount}
                  {pluralize(mentor.menteeCount, [' ??????????????', ' ????????????????', ' ??????????????'])}
                  <br />
                </>
              )}
            </div>

            {mentor.isVisible && (
              <div className="mb-6">
                <Link href={'/mentor/' + mentor.slug + '/contact'}>
                  <a className="button">???????????????? ????????????</a>
                </Link>
              </div>
            )}

            {mentor.about && (
              <div className="prose my-4">
                <b>?? ????????</b>
                <Markup
                  content={htmlContent(mentor.about)}
                  noWrap={true}
                  disableLineBreaks={true}
                />
              </div>
            )}

            {mentor.description && (
              <div className="prose my-4">
                <b>?? ?????? ????????????</b>
                <Markup
                  content={htmlContent(mentor.description)}
                  noWrap={true}
                  disableLineBreaks={true}
                />
              </div>
            )}

            {mentor.competencies && (
              <div className="prose my-4">
                <b>??????????????????????</b>
                <br />
                <i>{mentor.competencies}</i>
              </div>
            )}
          </div>

          <div className="flex-1 pl-4 hidden md:block">
            <img src={mentor.photo.url} />
          </div>
        </div>
      </Section>

      <Footer />
    </>
  )
}
