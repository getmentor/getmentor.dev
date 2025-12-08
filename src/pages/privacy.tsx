import Head from 'next/head'
import { Footer, MetaHeader, NavHeader, Section } from '@/components'
import seo from '@/config/seo'

export default function Privacy(): JSX.Element {
  const title = 'Политика в отношении обработки персональных данных | ' + seo.title

  return (
    <>
      <Head>
        <title>{title}</title>
        <MetaHeader customTitle="Политика в отношении обработки персональных данных" />
      </Head>

      <NavHeader className="bg-primary-100" />

      <Section className="bg-primary-100" id="header">
        <div className="text-center py-14 lg:w-3/4 mx-auto">
          <h1>Политика в отношении обработки персональных данных</h1>
        </div>
      </Section>

      <div className="iframe-wrapper">
        <iframe
          src="https://docs.google.com/document/d/e/2PACX-1vQ7TZDFd34wmte5fT02otFAariW18d5uLIR0LsOa9MyPNw6c_CkKEMrzuKlhlFHblcCov9C8XkEqBip/pub?embedded=true"
          style={{
            display: 'block',
            border: 'none',
            margin: '0 auto',
            width: '100%',
            height: '600px',
          }}
        />
      </div>

      <Footer />
    </>
  )
}
