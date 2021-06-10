import Head from 'next/head'
import NavHeader from '../components/NavHeader'
import Footer from '../components/Footer'
import Section from '../components/Section'

export default function Bementor() {
  return (
    <div>
      <Head>
        <title>Стань частью нашей команды | GetMentor – открытое сообщество IT-наставников</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <NavHeader />

      <Section className="bg-primary-100" id="header">
        <div className="text-center py-14 lg:w-3/4 mx-auto">
          <h1>Стань частью нашей команды</h1>

          <p>Помогать другим – почётно и круто. Спасибо, что хотите этим заниматься.<br/>
            Заполните <a href="https://airtable.com/shraFoLi9aSqzU4U9" target="_blank" rel="noreferrer">форму
              ниже</a>, и мы обязательно рассмотрим вашу заявку как можно скорее.
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
          }}>
        </iframe>
      </div>

      <Footer />
    </div>
  )
}
