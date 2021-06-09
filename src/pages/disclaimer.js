import Head from 'next/head'
import NavHeader from '../components/NavHeader'
import Footer from '../components/Footer'

export default function Disclaimer() {
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
                <h1>Отказ от ответственности</h1>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section" data-section="pdf">
        <a name="pdf"></a>
        <div className="container">
          <div className="iframe-wrapper">
            <iframe
              src="https://docs.google.com/document/d/e/2PACX-1vTT9EcJtmRC5v0XjegmCK5xeiuE3Pi3-9LwSlJNhPFZsnegRKD_E5mCTtd-GBkpMA9RVuQSBB4PEr9N/pub?embedded=true"
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
