import Head from 'next/head'
import NavHeader from '../components/NavHeader'
import Footer from '../components/Footer'

export default function Privacy() {
  return (
    <div>
      <Head>
        <title>Политика в отношении обработки персональных данных | GetMentor – открытое сообщество IT-наставников</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <NavHeader />

      <section className="banner banner--default bg-primary-100" data-section="header" >
        <div className="container">
          <div className="banner__inner">
            <div className="row">
              <div className="column banner__content">
                <h1>Политика в отношении обработки персональных данных</h1>
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
              src="https://docs.google.com/document/d/e/2PACX-1vQ7TZDFd34wmte5fT02otFAariW18d5uLIR0LsOa9MyPNw6c_CkKEMrzuKlhlFHblcCov9C8XkEqBip/pub?embedded=true"
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
