import Head from 'next/head'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheck, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons'
import Section from '../../../components/Section'
import ContactMentorForm from '../../../components/ContactMentorForm'
import seo from '../../../config/seo'
import Footer from '../../../components/Footer'
import NavHeader from '../../../components/NavHeader'
import { getOneMentorBySlug } from '../../../server/mentors-data'
import { useEffect, useState } from 'react'
import analytics from '../../../lib/analytics'
import Image from 'next/image'
import { InlineWidget } from 'react-calendly'
import Koalendar from '../../../components/Koalendar'
import CalendlabWidget from '../../../components/CalendlabWidget'
import { imageLoader } from '../../../lib/azure-image-loader'
import { withSSRObservability } from '../../../lib/with-ssr-observability'
import logger from '../../../lib/logger'

async function _getServerSideProps(context) {
  const mentor = await getOneMentorBySlug(context.params.slug)

  if (!mentor) {
    logger.warn('Mentor not found for contact page', { slug: context.params.slug })
    return {
      notFound: true,
    }
  }

  logger.info('Mentor contact page rendered', {
    mentorId: mentor.id,
    mentorSlug: mentor.slug,
    calendarType: mentor.calendarType,
  })

  return {
    props: {
      mentor,
    },
  }
}

export const getServerSideProps = withSSRObservability(_getServerSideProps, 'mentor-contact')

export default function OrderMentor({ mentor }) {
  const [readyStatus, setReadyStatus] = useState('')
  const [formData, setFormData] = useState()

  const REQUESTS_PER_DAY_KEY = 'requests_per_day'
  const today = new Date().toISOString().slice(0, 10)
  const MAX_REQUESTS_PER_DAY = 5

  const title = 'Запись к ментору | ' + mentor.name + ' | ' + seo.title

  // Helper function to get current request count from localStorage
  const getRequestsToday = () => {
    const storage = window.localStorage.getItem(REQUESTS_PER_DAY_KEY)
    if (storage !== null) {
      const nr_requests = JSON.parse(storage)
      return nr_requests[today] || 0
    }
    return 0
  }

  const hasRequestPerDayLeft = () => {
    const requestsToday = getRequestsToday()
    return requestsToday < MAX_REQUESTS_PER_DAY
  }

  const incrementRequestsPerDay = () => {
    const requestsToday = getRequestsToday()
    const nr_requests = {}
    nr_requests[today] = requestsToday + 1
    window.localStorage.setItem('requests_per_day', JSON.stringify(nr_requests))
  }

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Intentionally run once on mount - analytics tracking

  useEffect(() => {
    if (!hasRequestPerDayLeft()) {
      setReadyStatus('limit')
      return
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Intentionally run once on mount - check rate limit

  const onSubmit = (data) => {
    if (readyStatus === 'loading') {
      return
    }

    if (!hasRequestPerDayLeft()) {
      setReadyStatus('limit')
      return
    }

    setReadyStatus('loading')

    setFormData({ ...data })

    // SECURITY: Call Next.js API route (proxy), which calls Go API on localhost
    // This keeps Go API private (localhost only), not exposed to public internet
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
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`)
        }
        return res.json()
      })
      .then((data) => {
        if (data.success) {
          mentor.calendarUrl = data.calendar_url
          setReadyStatus('success')
          incrementRequestsPerDay()
        } else {
          setReadyStatus('error')
        }
      })
      .catch((e) => {
        setReadyStatus('error')
        // Client-side error - console.error is appropriate here
        console.error('Contact mentor error:', e)
      })
  }

  return (
    <>
      <Head>
        <title>{title}</title>
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
                  src={imageLoader({ src: mentor.slug, quality: 'large' })}
                  alt={mentor.name}
                  fill
                  sizes="100vw"
                  style={{
                    objectFit: 'cover',
                  }}
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

      {!mentor.isVisible && (
        <Section>
          <div className="flex justify-center">
            <div className="text-gray-500 mb-6">Ментор временно приостановил приём заявок.</div>
          </div>
        </Section>
      )}

      {mentor.isVisible && readyStatus === 'success' && (
        <Section>
          <SuccessMessage mentor={mentor} formData={formData} />
        </Section>
      )}

      {mentor.isVisible && readyStatus !== 'success' && readyStatus === 'limit' && (
        <Section>
          <LimitMessage mentor={mentor} />
        </Section>
      )}

      {mentor.isVisible && readyStatus !== 'success' && readyStatus !== 'limit' && (
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

function SuccessMessage({ mentor, formData }) {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Intentionally run once on mount - analytics tracking

  return (
    <div className="text-center">
      <div className="inline-flex justify-center items-center rounded-full h-24 w-24 bg-green-100 text-green-500">
        <FontAwesomeIcon icon={faCheck} size="2x" />
      </div>
      <p className="text-xl mt-6">Ваша заявка принята</p>

      <div className="flex justify-center">
        {mentor.calendarType !== 'none' ? (
          <div className="max-w-screen-md justify-center space-y-7 flex-wrap sm:flex-nowrap sm:space-y-0 sm:space-x-5">
            <p className="text-xl mt-6">
              Ментор получил вашу заявку и скоро с вами свяжется. Но вы можете выбрать удобное время
              для встречи уже сейчас в форме ниже.
            </p>
            <br />
            {mentor.calendarType === 'calendly' ? (
              <InlineWidget
                url={mentor.calendarUrl}
                prefill={{
                  name: formData?.name,
                  email: formData?.email,
                  customAnswers: {
                    a1: formData?.intro,
                  },
                }}
              />
            ) : mentor.calendarType === 'koalendar' ? (
              <Koalendar url={mentor.calendarUrl} />
            ) : mentor.calendarType === 'calendlab' ? (
              <CalendlabWidget url={mentor.calendarUrl} />
            ) : (
              <a className="button" href={mentor.calendarUrl} target="_blank" rel="noreferrer">
                Записаться на встречу
              </a>
            )}
          </div>
        ) : (
          <p>Скоро ментор свяжется с вами.</p>
        )}
      </div>
    </div>
  )
}

function LimitMessage({ mentor }) {
  useEffect(() => {
    analytics.event('Mentor Request Limit Exceeded', {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Intentionally run once on mount - analytics tracking

  return (
    <div className="text-center">
      <div className="inline-flex justify-center items-center rounded-full h-24 w-24 bg-red-100 text-red-500">
        <FontAwesomeIcon icon={faExclamationTriangle} size="2x" />
      </div>
      <p className="text-xl mt-6">
        Превышено количество заявок на сегодня. Чтобы связаться с новым ментором, возвращайтесь
        завтра.
      </p>
    </div>
  )
}
