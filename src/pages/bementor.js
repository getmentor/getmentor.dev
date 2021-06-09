import Head from 'next/head'
import NavHeader from '../components/NavHeader'
import Footer from '../components/Footer'

export default function Bementor() {
  return (
    <div>
      <Head>
        <title>GetMentor – открытое сообщество IT-наставников</title>
        <meta
          name="description"
          content="GetMentor – это открытое комьюнити IT-наставников, готовых делиться своими опытом и знаниями. Наша задача – помогать людям находить ответы на свои вопросы в работе или жизни через прямой доступ к экспертизе в разговоре 1-на-1."
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <NavHeader />

      <section data-section="header" className="banner banner--default">
        <div className="container">
          <div className="banner__inner">
            <div className="row">
              <div className="column banner__content">
                <h1>Стань частью нашей команды</h1>
                <p>Помогать другим – почётно и круто. Спасибо, что хотите этим заниматься.<br/>
                  Заполните <a href="https://airtable.com/shraFoLi9aSqzU4U9" target="_blank">форму
                  ниже</a>, и мы обязательно рассмотрим вашу заявку как можно скорее.
              </p></div>
            </div>
          </div>
        </div>
      </section>

      <section className="section" data-section="form">
        <a name="form"></a>
        <div className="container">
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
        </div>
      </section>

      <Footer />
    </div>
  )
}
