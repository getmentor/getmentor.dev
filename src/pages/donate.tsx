import Head from 'next/head'
import type { GetServerSideProps } from 'next'
import { DonateLinks, Footer, MetaHeader, NavHeader, Section } from '@/components'
import donates from '@/config/donates'
import seo from '@/config/seo'
import { withSSRObservability } from '@/lib/with-ssr-observability'
import logger, { getTraceContext } from '@/lib/logger'

type Supporter = {
  name: string
  level: number
  url?: string
}

// Add SSR observability for metrics, logs, and traces
const _getServerSideProps: GetServerSideProps = async (context) => {
  logger.info('Donate page rendered', {
    userAgent: context.req.headers['user-agent'],
    ...getTraceContext(),
  })

  return {
    props: {},
  }
}

export const getServerSideProps = withSSRObservability(_getServerSideProps, 'donate')

export default function Donate(): JSX.Element {
  const supporters: Supporter[] = [
    {
      name: '👑 Антон Алексеев',
      level: 4,
      url: 'https://getmentor.dev/mentor/anton-alekseev-4855',
    },
    { name: 'Roman Podymov', level: 2 },
    { name: 'Katsiaryna Kukso', level: 2 },
    { name: 'usukololgubu', level: 2 },

    // { name: 'Стример', level: 2 },
    // { name: 'Меценат', level: 3 },
    // { name: 'Мини-спонсор', level: 4, url: 'https://getmentor.dev/' },
  ]

  const title = 'Донат | ' + seo.title

  return (
    <>
      <Head>
        <title>{title}</title>
        <MetaHeader customTitle="Донат" />
      </Head>

      <NavHeader className="bg-primary-100" />

      <Section className="bg-primary-100" id="header">
        <div className="text-center pt-14 lg:w-1/2 mx-auto">
          <h1>🍩 Донат</h1>

          <p className="pt-6">
            Мы хотим, чтобы менторство было доступно для всех. Поэтому наш проект — некоммерческий.
            Мы не берём денег ни с менторов, ни с учеников.
          </p>
          <p>
            Если вам близко, что мы делаем, поддержите нас донатом. Он поможет нам обслуживать
            сервера, оплачивать хостинги и развивать сайт 🍩
          </p>
        </div>
      </Section>

      <Section id="list">
        <Section.Title>Как донатить</Section.Title>

        <DonateLinks
          donates={donates}
          itemClassName="rounded hover:bg-gray-100 h-20 px-8 flex justify-center items-center"
        />

        <div className="text-center">
          <p>
            Если ни один из способов не подходит —{' '}
            <a className="link" href="mailto:hello@getmentor.dev">
              напиши нам
            </a>
            . Что-нибудь придумаем.
          </p>
        </div>
      </Section>

      <Section className="bg-gray-100" id="patrons">
        <Section.Title>Нас поддерживают</Section.Title>

        <div className="text-center">
          <p>Эти люди поддерживают нас через Patreon. Спасибо им!</p>
        </div>

        {supporters.map((supporter) => (
          <div className="rounded-md shadow-md bg-white py-4 px-5 mb-5" key={supporter.name}>
            <div className="flex justify-between">
              <div>
                <h3 className="text-lg">{supporter.name}</h3>

                <div className="text-sm pt-1 text-gray-600">
                  Уровень:{' '}
                  <b>
                    {supporter.level === 2 && 'Стример'}
                    {supporter.level === 3 && 'Меценат 👑'}
                    {supporter.level === 4 && 'Мини-спонсор 💰'}
                  </b>
                </div>

                {supporter.level === 4 && (
                  <>
                    <div className="text-sm pt-1 text-gray-600">
                      <a href={supporter.url} target="_blank" rel="nofollow noreferrer">
                        {supporter.url}
                      </a>
                    </div>
                  </>
                )}
              </div>

              <div>{supporter.level > 1 ? <span>❤️🤟</span> : <span>❤️</span>}</div>
            </div>
          </div>
        ))}
      </Section>

      <Footer />
    </>
  )
}
