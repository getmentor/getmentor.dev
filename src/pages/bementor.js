import Head from 'next/head'
import NavHeader from '../components/NavHeader'
import Footer from '../components/Footer'
import Section from '../components/Section'
import { useEffect } from 'react'
import analytics from '../lib/analytics'
import MetaHeader from '../components/MetaHeader'
import seo from '../config/seo'

export default function Bementor() {
  useEffect(() => {
    analytics.event('Visit Bementor Page')
  }, [])

  const title = 'Стань частью нашей команды | ' + seo.title

  return (
    <>
      <Head>
        <title>{title}</title>
        <MetaHeader customTitle="Стань частью нашей команды" />
      </Head>

      <NavHeader className="bg-primary-100" />

      <Section className="bg-primary-100" id="header">
        <div className="text-center py-14 lg:w-3/4 mx-auto">
          <h1>Стань частью нашей команды</h1>

          <p>
            Помогать другим – почётно и круто. Спасибо, что хотите этим заниматься.
            <br />
            Заполните{' '}
            <a
              className="link"
              href="https://airtable.com/shraFoLi9aSqzU4U9"
              target="_blank"
              rel="noreferrer"
            >
              форму ниже
            </a>
            , и мы обязательно рассмотрим вашу заявку как можно скорее.
          </p>
        </div>
      </Section>

      <div className="iframe-wrapper">
        <iframe
          src="https://airtable.com/embed/shraFoLi9aSqzU4U9?backgroundColor=white"
          style={{
            display: 'block',
            border: 'none',
            margin: '0 auto',
            width: '100%',
            height: '600px',
          }}
        ></iframe>
      </div>

      <Footer />
    </>
  )
}
