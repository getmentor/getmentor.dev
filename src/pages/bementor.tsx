import Head from 'next/head'
import { useEffect, useState } from 'react'
import type { GetServerSideProps } from 'next'
import { Footer, MetaHeader, NavHeader, Section } from '@/components'
import RegisterMentorForm from '@/components/forms/RegisterMentorForm'
import analytics from '@/lib/analytics'
import seo from '@/config/seo'
import { withSSRObservability } from '@/lib/with-ssr-observability'
import logger from '@/lib/logger'
import type { RegisterMentorRequest, RegisterMentorResponse } from '@/types/api'

// Add SSR observability for metrics, logs, and traces
const _getServerSideProps: GetServerSideProps = async (context) => {
  logger.info('Bementor page rendered', {
    userAgent: context.req.headers['user-agent'],
  })

  return {
    props: {},
  }
}

export const getServerSideProps = withSSRObservability(_getServerSideProps, 'bementor')

export default function Bementor(): JSX.Element {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    analytics.event('Visit Become Mentor Page')
  }, [])

  const handleSubmit = async (data: RegisterMentorRequest): Promise<void> => {
    setIsSubmitting(true)
    setSubmitStatus('idle')
    setErrorMessage('')

    try {
      analytics.event('Submit Mentor Registration', {
        name: data.name,
        email: data.email,
        job: data.job,
        workplace: data.workplace,
        experience: data.experience,
        price: data.price,
        tags: data.tags.join(', '),
      })

      const response = await fetch('/api/register-mentor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const result: RegisterMentorResponse = await response.json()

      if (response.ok && result.success) {
        setSubmitStatus('success')
        analytics.event('Mentor Registration Success', {
          mentorId: result.mentorId,
        })
      } else {
        setSubmitStatus('error')
        setErrorMessage(result.error || 'Произошла ошибка при отправке заявки.')
        analytics.event('Mentor Registration Error', {
          error: result.error || 'Unknown error',
        })
      }
    } catch (error) {
      setSubmitStatus('error')
      setErrorMessage('Произошла ошибка при отправке заявки. Попробуйте позже.')
      analytics.event('Mentor Registration Error', {
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const title = 'Стань частью нашей команды | ' + seo.title

  return (
    <>
      <Head>
        <title>{title}</title>
        <MetaHeader customTitle="Стань частью нашей команды" />
      </Head>

      <NavHeader className="bg-primary-100" />

      <Section className="bg-primary-100" id="header">
        <div className="text-center py-4 lg:w-3/4 mx-auto">
          <h1>Стань частью нашей команды</h1>

          <p>
            Помогать другим – почётно и круто. Спасибо, что хотите этим заниматься.
            <br />
            Заполните форму ниже, и мы обязательно рассмотрим вашу заявку как можно скорее.
            <br />
            <br />
            <em>
              Если форма ниже по какой-то причине не работает, используйте эту{' '}
              <u>
                <a
                  href="https://airtable.com/shraFoLi9aSqzU4U9"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  ссылку
                </a>
              </u>
              .
            </em>
          </p>
        </div>
      </Section>

      <Section>
        <div className="max-w-3xl mx-auto">
          {submitStatus === 'success' && (
            <div className="mb-8 p-6 bg-green-50 border border-green-200 rounded-lg">
              <p className="font-bold text-green-800 mb-2">Спасибо за вашу заявку!</p>
              <p className="text-green-700">
                Спасибо! Ваша заявка принята. Вам на почту придёт подтверждение в ближайшее время.
                Если его не будет, то пожалуйста проверьте спам, и напишите нам на{' '}
                <a href="mailto:hello@getmentor.dev">hello@getmentor.dev</a>.
                <br />
                <br />
                ВАЖНО! Мы рассмотрим вашу заявку в течение нескольких дней. Потом вам на почту
                придет письмо с дальнейшими инструкциями. Не пропустите его, оно полезное и
                расскажет, как завершить регистрацию. Мы стараемся рассматривать новые заявки как
                можно скорее. Однако этот процесс может занять до 2х недель. Если вдруг от нас не
                будет новостей, то <a href="mailto:hello@getmentor.dev">пишите нам</a>, разберемся.
                <br />
                <br />
                Удачи!
              </p>
            </div>
          )}

          {submitStatus === 'error' && (
            <div className="mb-8 p-6 bg-red-50 border border-red-200 rounded-lg">
              <p className="font-bold text-red-800 mb-2">Ошибка при отправке заявки</p>
              <p className="text-red-700">{errorMessage}</p>
            </div>
          )}

          {submitStatus !== 'success' && (
            <RegisterMentorForm
              isLoading={isSubmitting}
              isError={submitStatus === 'error'}
              onSubmit={handleSubmit}
            />
          )}
        </div>
      </Section>

      <Footer />
    </>
  )
}
