import { getMentors } from '../../server/cached-mentors'
import Head from 'next/head'
import Section from '../../components/Section'
import ContactMentorForm from '../../components/ContactMentorForm'
import seo from '../../config/seo'
import Footer from '../../components/Footer'
import NavHeader from '../../components/NavHeader'

export async function getServerSideProps(context) {
  const allMentors = await getMentors()
  const mentor = allMentors.find((mentor) => mentor.slug === context.params.slug)

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

export default function OrderMentor(props) {
  const { mentor } = props

  return (
    <>
      <Head>
        <title>
          Запись к ментору | {mentor.name} | {seo.title}
        </title>
      </Head>

      <NavHeader />

      <Section>
        <h1>Запись к ментору</h1>
      </Section>

      <Section>
        <div className="flex">
          <img className="w-32 mr-10" src={mentor.photo.url} />

          <div>
            <h2 className="mb-2">{mentor.name}</h2>
            <div className="mb-3">{mentor.job}</div>

            <div className="mb-4">
              <b>Опыт:</b> {mentor.experience}
              <br />
              <b>Цена:</b> {mentor.price}
              <br />
            </div>
          </div>
        </div>
      </Section>

      <Section>
        <ContactMentorForm />
      </Section>

      <Footer />
    </>
  )
}
