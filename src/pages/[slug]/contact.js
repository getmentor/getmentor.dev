import Head from 'next/head'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheck } from '@fortawesome/free-solid-svg-icons'
import Section from '../../components/Section'
import ContactMentorForm from '../../components/ContactMentorForm'
import seo from '../../config/seo'
import Footer from '../../components/Footer'
import NavHeader from '../../components/NavHeader'
import { getMentors } from '../../server/cached-mentors'
import { useState } from 'react'

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

  const [readyStatus, setReadyStatus] = useState('')

  const onSubmit = (data) => {
    if (readyStatus === 'loading') {
      return
    }

    setReadyStatus('loading')

    fetch('/api/contact-mentor', {
      method: 'POST',
      body: JSON.stringify({
        ...data,
        mentorAirtableId: mentor.id,
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then((res) => {
        return res.json()
      })
      .then((data) => {
        if (data.success) {
          setReadyStatus('success')
        } else {
          setReadyStatus('error')
        }
      })
      .catch((e) => {
        setReadyStatus('error')
        console.error(e)
      })
  }

  return (
    <>
      <Head>
        <title>
          Запись к ментору | {mentor.name} | {seo.title}
        </title>
      </Head>

      <NavHeader />

      <Section>
        <h1 className="text-center">Запись к ментору</h1>
      </Section>

      <Section>
        <div className="flex justify-center">
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
        </div>
      </Section>

      {readyStatus === 'success' ? (
        <Section>
          <div className="text-center">
            <div className="inline-flex justify-center items-center rounded-full h-24 w-24 bg-green-100 text-green-500">
              <FontAwesomeIcon icon={faCheck} size="2x" />
            </div>
            <h3 className="text-2xl mt-6">Ваша заявка принята</h3>
            <p>Скоро ментор свяжется с вами.</p>
          </div>
        </Section>
      ) : (
        <Section>
          <div className="max-w-md mx-auto">
            <ContactMentorForm
              isLoading={readyStatus === 'loading'}
              isError={readyStatus === 'error'}
              onSubmit={onSubmit}
            />
          </div>
        </Section>
      )}

      <Footer />
    </>
  )
}
