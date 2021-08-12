import { useEffect, useState, Fragment } from 'react'
import { Transition } from '@headlessui/react'
import Head from 'next/head'
import ProfileForm from '../components/ProfileForm'
import NavHeader from '../components/NavHeader'
import Section from '../components/Section'
import Footer from '../components/Footer'
import { getMentors } from '../server/cached-mentors'
import seo from '../config/seo'
import Notification from '../components/Notification'
import { AUTH_TOKEN } from '../lib/entities'
import Error from 'next/error'

export async function getServerSideProps(context) {
  const allMentors = await getMentors()

  const mentor = allMentors.find((mentor) => String(mentor.id) === context.query.id)
  if (!mentor) {
    return { notFound: true }
  }

  if (!context.query.token || mentor[AUTH_TOKEN] !== context.query.token) {
    return {
      props: { errorCode: 403, mentor: null },
    }
  }

  return {
    props: { errorCode: 0, mentor },
  }
}

export default function Profile({ errorCode, mentor }) {
  const [readyStatus, setReadyStatus] = useState('')
  const [showSuccess, setShowSuccess] = useState(false)

  useEffect(() => {
    let timer
    if (readyStatus === 'success') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
      setShowSuccess(true)
      timer = setTimeout(() => setShowSuccess(false), 3000)
    }
    return () => {
      clearInterval(timer)
    }
  }, [readyStatus])

  const onSubmit = (data) => {
    if (readyStatus === 'loading') {
      return
    }

    setReadyStatus('loading')

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
        <title>Профиль | {seo.title}</title>
      </Head>

      <NavHeader />

      <Section>
        <h1 className="text-center">Профиль</h1>
      </Section>

      <Section>
        <div className="max-w-screen-md mx-auto">
          <ProfileForm
            mentor={mentor}
            isLoading={readyStatus === 'loading'}
            isError={readyStatus === 'error'}
            onSubmit={onSubmit}
          />
        </div>
      </Section>

      <div
        aria-live="assertive"
        className="fixed z-10 inset-0 flex items-end px-4 py-6 pointer-events-none sm:p-6 sm:items-start"
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
