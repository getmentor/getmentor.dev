import Head from 'next/head'
import ReactMarkdown from 'react-markdown'
import NavHeader from '../../components/NavHeader'
import Footer from '../../components/Footer'
import { getMentors } from '../../server/cached-mentors'

export async function getServerSideProps(context) {
  const allMentors = await getMentors()
  const mentor = allMentors.find(mentor => mentor.slug === context.params.slug)

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

export default function Mentor(props) {
  const { mentor } = props

  return (
    <div>
      <Head>
        <title>{mentor.name} | GetMentor – открытое сообщество IT-наставников</title>
      </Head>

      <NavHeader />

      <section className="section" data-section="body">
        <a name="body"></a>

        <div className="container">
          <div className="section__content">
            <h1 className="mb-2">{mentor.name}</h1>
            <div className="mb-4">{mentor.job}</div>

            <div className="flex flex-wrap -m-2 mb-4">
              {mentor.tags.map(tag => (
                <div className="border-2 border-gray-700 rounded-full py-1 px-4 m-2">{tag}</div>
              ))}
            </div>

            <div className="flex">
              <div className="flex-1 text-center">
                <img src={mentor.photo.url} />
              </div>

              <div className="flex-1 px-4">
                <div>
                  <b>Опыт:</b> {mentor.experience}<br/>
                  <b>Цена:</b> {mentor.price}<br/>
                </div>

                <div className="my-4">
                  <ReactMarkdown>{mentor.description}</ReactMarkdown>
                </div>

                <div className="section__cta">
                  <a
                    className="button"
                    href={'https://airtable.com/shr5aTzZF5zKSRUDG?prefill_Mentor=' + mentor.id}
                  >Оставить заявку</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
