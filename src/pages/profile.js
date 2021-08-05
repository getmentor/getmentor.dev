import { useState } from 'react'
import Head from 'next/head'
import ProfileForm from '../components/ProfileForm'
import NavHeader from '../components/NavHeader'
import Section from '../components/Section'
import Footer from '../components/Footer'
import { getMentors } from '../server/cached-mentors'
import seo from '../config/seo'

export async function getServerSideProps(context) {
  const allMentors = await getMentors()
  const mentor = allMentors.find((mentor) => mentor.airtableId === context.query.token) // TODO mentor token

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

export default function Profile({ mentor }) {
  const [readyStatus, setReadyStatus] = useState('')

  const onSubmit = (data) => {
    if (readyStatus === 'loading') {
      return
    }

    setReadyStatus('loading')

    // TODO mentor token
    fetch('/api/save-profile?token=' + mentor.airtableId, {
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
        if (data.success) {
          setReadyStatus('success')
        } else {
          setReadyStatus('error')
        }
      })
      .catch((e) => {
        setReadyStatus('error')
        console.error(e)
      })
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

      <Footer />
    </>
  )
}
