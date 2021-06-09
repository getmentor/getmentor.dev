import { getMentor } from '../../lib/mentors'
import Head from "next/head";
import NavHeader from '../../components/NavHeader'
import Footer from '../../components/Footer'

export async function getServerSideProps(context) {
  const mentor = await getMentor(context.params.id)

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
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <NavHeader />

      <section data-section="header" className="banner banner--default">
        <div className="container">
          <div className="banner__inner">
            <div className="row">
              <div className="column banner__content">
                <h1>{mentor.name}</h1>
                <h3>{mentor.job}</h3>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section" data-section="body">
        <a name="body"></a>

        <div className="container">
          <div className="section__content">
            <div className="row row--center-cols row--img-left">
              <div className="column col--img">
                <img src={mentor.photo.url} />
              </div>
              <div className="column col--text">
                <p>{mentor.description}</p>
                <p>
                  <b>Цена:</b> {mentor.price}<br/>
                  <b>Опыт:</b> {mentor.experience}<br/>
                  <b>Теги:</b> {mentor.tags.join(', ')}
                </p>

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
