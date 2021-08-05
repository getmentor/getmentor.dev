import Head from 'next/head'
import ProfileForm from '../components/ProfileForm'
import NavHeader from '../components/NavHeader'
import Section from '../components/Section'
import Footer from '../components/Footer'
import { getMentors } from '../server/cached-mentors'
import seo from '../config/seo'

export async function getServerSideProps(context) {
  const allMentors = await getMentors()
  const mentor = allMentors.find((mentor) => mentor.id === context.query.token)

  if (!mentor) {
    return {
      notFound: true,
    }
  }

  return {
    props: {
      mentor,
    },
  }
}

export default function Profile({ mentor }) {
  const onSubmit = (data) => {
    console.log(data)
  }

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
        <div className="max-w-screen-md mx-auto">
          <ProfileForm mentor={mentor} isLoading={false} isError={false} onSubmit={onSubmit} />
        </div>
      </Section>

      <Footer />
    </>
  )
}
