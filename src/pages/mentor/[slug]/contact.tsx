import Head from 'next/head'
import { useEffect, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheck, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons'
import Image from 'next/image'
import { InlineWidget } from 'react-calendly'
import type { GetServerSideProps, InferGetServerSidePropsType } from 'next'
import {
  CalendlabWidget,
  ContactMentorForm,
  Footer,
  Koalendar,
  NavHeader,
  Section,
} from '@/components'
import seo from '@/config/seo'
import { getOneMentorBySlug } from '@/server/mentors-data'
import analytics from '@/lib/analytics'
import { imageLoader } from '@/lib/azure-image-loader'
import { withSSRObservability } from '@/lib/with-ssr-observability'
import logger, { getTraceContext } from '@/lib/logger'
import type { MentorBase } from '@/types'

// Rate limiting configuration
const RATE_LIMIT_CONFIG = {
  MAX_REQUESTS_PER_DAY: 5,
  STORAGE_KEY: 'requests_per_day',
}

type ReadyStatus = '' | 'loading' | 'success' | 'error' | 'limit'
type MentorContact = MentorBase & { calendarUrl?: string | null }

interface ContactFormData {
  email: string
  name: string
  intro: string
  experience?: string
  telegramUsername: string
  recaptchaToken: string
}

const _getServerSideProps: GetServerSideProps<{ mentor: MentorContact }> = async (context) => {
  const slugParam = context.params?.slug
  const slug = Array.isArray(slugParam) ? slugParam[0] : slugParam

  if (!slug) {
    logger.warn('Mentor slug missing on contact page', { ...getTraceContext() })
    return { notFound: true }
  }

  const mentor = await getOneMentorBySlug(slug)

  if (!mentor) {
    logger.warn('Mentor not found for contact page', { slug, ...getTraceContext() })
    return {
      notFound: true,
    }
  }

  logger.info('Mentor contact page rendered', {
    mentorId: mentor.id,
    mentorSlug: mentor.slug,
    calendarType: mentor.calendarType,
    ...getTraceContext(),
  })

  return {
    props: {
      mentor,
    },
  }
}

export const getServerSideProps = withSSRObservability(_getServerSideProps, 'mentor-contact')

export default function OrderMentor({
  mentor,
}: InferGetServerSidePropsType<typeof getServerSideProps>): JSX.Element {
  const [readyStatus, setReadyStatus] = useState<ReadyStatus>('')
  const [formData, setFormData] = useState<ContactFormData | undefined>()

  const today = new Date().toISOString().slice(0, 10)
  const title = 'Запись к ментору | ' + mentor.name + ' | ' + seo.title

  // Helper function to get current request count from localStorage
  const getRequestsToday = (): number => {
    const storage = window.localStorage.getItem(RATE_LIMIT_CONFIG.STORAGE_KEY)
    if (storage !== null) {
      const nr_requests = JSON.parse(storage) as Record<string, number>
      return nr_requests[today] || 0
    }
    return 0
  }

  const hasRequestPerDayLeft = (): boolean => {
    const requestsToday = getRequestsToday()
    return requestsToday < RATE_LIMIT_CONFIG.MAX_REQUESTS_PER_DAY
  }

  const incrementRequestsPerDay = (): void => {
    const requestsToday = getRequestsToday()
    const nr_requests: Record<string, number> = {}
    nr_requests[today] = requestsToday + 1
    window.localStorage.setItem(RATE_LIMIT_CONFIG.STORAGE_KEY, JSON.stringify(nr_requests))
  }

  useEffect(() => {
    analytics.event('Request a Mentor', {
      'Mentor Id': mentor.id,
      'Mentor Name': mentor.name,
      'Mentor Experience': mentor.experience,
      'Mentor Price': mentor.price,
      'Mentor Sponsors': mentor.sponsors,
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

  const onSubmit = (data: ContactFormData): void => {
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
        return res.json() as Promise<{ success: boolean; calendar_url?: string }>
      })
      .then((responseData) => {
        if (responseData.success) {
          mentor.calendarUrl = responseData.calendar_url
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

interface SuccessMessageProps {
  mentor: MentorContact
  formData?: ContactFormData
}

function SuccessMessage({ mentor, formData }: SuccessMessageProps) {
  useEffect(() => {
    analytics.event('Mentor Request Sent', {
      'Mentor Id': mentor.id,
      'Mentor Name': mentor.name,
      'Mentor Experience': mentor.experience,
      'Mentor Price': mentor.price,
      'Mentor Sponsors': mentor.sponsors,
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
                url={mentor.calendarUrl ?? ''}
                prefill={{
                  name: formData?.name,
                  email: formData?.email,
                  customAnswers: {
                    a1: formData?.intro,
                  },
                }}
              />
            ) : mentor.calendarType === 'koalendar' ? (
              <Koalendar url={mentor.calendarUrl ?? ''} />
            ) : mentor.calendarType === 'calendlab' ? (
              <CalendlabWidget url={mentor.calendarUrl ?? ''} />
            ) : (
              <a
                className="button"
                href={mentor.calendarUrl ?? ''}
                target="_blank"
                rel="noreferrer"
              >
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

interface LimitMessageProps {
  mentor: MentorContact
}

function LimitMessage({ mentor }: LimitMessageProps) {
  useEffect(() => {
    analytics.event('Mentor Request Limit Exceeded', {
      'Mentor Id': mentor.id,
      'Mentor Name': mentor.name,
      'Mentor Experience': mentor.experience,
      'Mentor Price': mentor.price,
      'Mentor Sponsors': mentor.sponsors,
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
