import Head from 'next/head'
import ProfileForm from '../components/ProfileForm'
import NavHeader from '../components/NavHeader'
import Section from '../components/Section'
import seo from '../config/seo'
import Footer from '../components/Footer'

export default function Profile() {
  return (
    <>
      <Head>
        <title>Профиль | {seo.title}</title>
      </Head>

      <NavHeader />

      <Section>
        <h1 className="text-center">Профиль</h1>
      </Section>

      <Section>
        <div className="max-w-lg mx-auto">
          <ProfileForm />
        </div>
      </Section>

      <Footer />
    </>
  )
}
