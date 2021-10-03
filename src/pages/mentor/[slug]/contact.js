import Head from 'next/head'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheck } from '@fortawesome/free-solid-svg-icons'
import Section from '../../../components/Section'
import ContactMentorForm from '../../../components/ContactMentorForm'
import seo from '../../../config/seo'
import Footer from '../../../components/Footer'
import NavHeader from '../../../components/NavHeader'
import { getMentors } from '../../../server/cached-mentors'
import { useEffect, useState } from 'react'
import analytics from '../../../lib/analytics'
import Image from 'next/image'

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

export default function OrderMentor({ mentor }) {
  useEffect(() => {
    analytics.event('Request a Mentor', {
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
    })
  }, [])

  const [readyStatus, setReadyStatus] = useState('')

  const onSubmit = (data) => {
    if (readyStatus === 'loading') {
      return
    }

    setReadyStatus('loading')

    fetch('/api/contact-mentor', {
      method: 'POST',
      body: JSON.stringify({
        ...data,
        mentorAirtableId: mentor.airtableId,
      }),
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
        <title>
          Запись к ментору | {mentor.name} | {seo.title}
        </title>
      </Head>

      <NavHeader />

      <Section>
        <h1 className="text-center">Запись к ментору</h1>
      </Section>

      <Section>
        <div className="flex justify-center">
          <div className="max-w-screen-md flex justify-center space-y-7 flex-wrap sm:flex-nowrap sm:space-y-0 sm:space-x-5">
            <div className="w-full sm:w-32">
              <div className="aspect-w-1 aspect-h-1 relative">
                <Image
                  src={mentor.photo.thumbnails?.large.url || mentor.photo_url}
                  alt={mentor.name}
                  layout="fill"
                  objectFit="cover"
                  unoptimized={true}
                />
              </div>
            </div>

            <div style={{ wordBreak: 'break-word' }}>
              <h2 className="mb-2">{mentor.name}</h2>
              <div className="mb-3">
                {mentor.job} @ {mentor.workplace}
              </div>

              <div className="mb-4">
                <b>Опыт:</b> {mentor.experience} лет
                <br />
                <b>Цена:</b> {mentor.price}
                <br />
              </div>
            </div>
          </div>
        </div>
      </Section>

      {readyStatus === 'success' ? (
        <Section>
          <SuccessMessage mentor={mentor} />
        </Section>
      ) : (
        <Section>
          <div className="max-w-md mx-auto">
            <ContactMentorForm
              isLoading={readyStatus === 'loading'}
              isError={readyStatus === 'error'}
              onSubmit={onSubmit}
            />
          </div>
        </Section>
      )}

      <Footer />
    </>
  )
}

function SuccessMessage({ mentor }) {
  useEffect(() => {
    analytics.event('Mentor Request Sent', {
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
    })
  }, [])

  return (
    <div className="text-center">
      <div className="inline-flex justify-center items-center rounded-full h-24 w-24 bg-green-100 text-green-500">
        <FontAwesomeIcon icon={faCheck} size="2x" />
      </div>
      <h3 className="text-2xl mt-6">Ваша заявка принята</h3>
      <p>Скоро ментор свяжется с вами.</p>
    </div>
  )
}
