import { useEffect, useState, Fragment } from 'react'
import { Transition } from '@headlessui/react'
import Head from 'next/head'
import ProfileForm from '../components/ProfileForm'
import NavHeader from '../components/NavHeader'
import Section from '../components/Section'
import Footer from '../components/Footer'
import { getOneMentorById } from '../server/mentors-data'
import seo from '../config/seo'
import filters from '../config/filters'
import Notification from '../components/Notification'
import Error from 'next/error'
import analytics from '../lib/analytics'
import Link from 'next/link'

export async function getServerSideProps(context) {
  context.query.id = parseInt(context.query.id, 10)
  if (isNaN(context.query.id)) {
    return { notFound: true }
  }

  const mentor = await getOneMentorById(context.query.id, { showHiddenFields: true })

  if (!mentor) {
    return { notFound: true }
  }

  if (!context.query.token || mentor.authToken !== context.query.token) {
    return {
      props: { errorCode: 403, mentor: null },
    }
  }

  return {
    props: { errorCode: 0, mentor },
  }
}

export default function Profile({ errorCode, mentor }) {
  useEffect(() => {
    if (mentor) {
      analytics.event('Open Profile', {
        'Mentor Id': mentor.id,
        'Mentor Name': mentor.name,
        'Mentor Experience': mentor.experience,
        'Mentor Price': mentor.price,
      })
    }
  }, [])

  const [readyStatus, setReadyStatus] = useState('')
  const [showSuccess, setShowSuccess] = useState(false)

  const title = 'Профиль | ' + seo.title

  useEffect(() => {
    let timer
    if (readyStatus === 'success') {
      setShowSuccess(true)
      timer = setTimeout(() => setShowSuccess(false), 3000)
    }
    return () => {
      clearTimeout(timer)
    }
  }, [readyStatus])

  const onSubmit = (data) => {
    if (readyStatus === 'loading') {
      return
    }

    setReadyStatus('loading')

    analytics.event('Save Profile', {
      'Mentor Id': mentor.id,
      'Mentor Name': mentor.name,
      'Mentor Experience': mentor.experience,
      'Mentor Price': mentor.price,
    })

    fetch('/api/save-profile' + location.search, {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then((res) => {
        return res.json()
      })
      .then((data) => {
        setReadyStatus(data.success ? 'success' : 'error')
      })
      .catch((e) => {
        setReadyStatus('error')
        console.error(e)
      })
  }

  if (errorCode) {
    return <Error statusCode={403} title="Access denied" />
  }

  return (
    <>
      <Head>
        <title>{title}</title>
      </Head>

      <NavHeader />

      <Section>
        <div className="text-center">
          <h1 className="mb-6">Профиль</h1>
          <Link href={'/mentor/' + mentor.slug}>
            <a className="link text-sm" target="_blank">
              Открыть личную страницу
            </a>
          </Link>
        </div>
      </Section>

      <Section>
        <div className="max-w-screen-md mx-auto">
          <ProfileForm
            mentor={{
              ...mentor,
              tags: mentor.tags.filter((tag) => !filters.sponsors.includes(tag)),
            }}
            isLoading={readyStatus === 'loading'}
            isError={readyStatus === 'error'}
            onSubmit={onSubmit}
          />
        </div>
      </Section>

      <div
        aria-live="assertive"
        className="fixed z-10 inset-0 flex items-end px-4 py-6 pointer-events-none sm:p-6"
      >
        <div className="w-full flex flex-col items-center space-y-4 sm:items-end">
          <Transition
            show={showSuccess}
            as={Fragment}
            enter="transform ease-out duration-300 transition"
            enterFrom="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
            enterTo="translate-y-0 opacity-100 sm:translate-x-0"
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Notification
              content="Данные успешно сохранены"
              onClose={() => setShowSuccess(false)}
            />
          </Transition>
        </div>
      </div>

      <Footer />
    </>
  )
}
