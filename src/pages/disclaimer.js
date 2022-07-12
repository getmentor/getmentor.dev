import Head from 'next/head'
import NavHeader from '../components/NavHeader'
import Footer from '../components/Footer'
import Section from '../components/Section'
import MetaHeader from '../components/MetaHeader'
import seo from '../config/seo'

export default function Disclaimer() {
  const title = 'Отказ от ответственности | ' + seo.title

  return (
    <>
      <Head>
        <title>{title}</title>
        <MetaHeader customTitle="Отказ от ответственности" />
      </Head>

      <NavHeader className="bg-primary-100" />

      <Section className="bg-primary-100" id="header">
        <div className="text-center py-14 lg:w-3/4 mx-auto">
          <h1>Отказ от ответственности</h1>
        </div>
      </Section>

      <div className="iframe-wrapper">
        <iframe
          src="https://docs.google.com/document/d/e/2PACX-1vTT9EcJtmRC5v0XjegmCK5xeiuE3Pi3-9LwSlJNhPFZsnegRKD_E5mCTtd-GBkpMA9RVuQSBB4PEr9N/pub?embedded=true"
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
