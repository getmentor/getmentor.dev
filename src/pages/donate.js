import Head from 'next/head'
import NavHeader from '../components/NavHeader'
import Footer from '../components/Footer'
import Section from '../components/Section'
import donates from '../config/donates'
import Image from 'next/image'
import MetaHeader from '../components/MetaHeader'
import seo from '../config/seo'

export default function Donate() {
  const supporters = [
    // { name: 'Денис Бесков', level: 4, url: 'https://systems.education/' },
    // { name: 'Марина Гладышева', level: 2 },
    // { name: 'Artem Grygorenko', level: 2 },
    { name: 'Paul Seredkin', level: 2 },
    { name: 'Ленар Фаттахов', level: 2 },
    // { name: 'Иван Богданов', level: 2 },
    //{ name: 'Михаил Князев', level: 3 },
    //{ name: 'Иван Круглов', level: 3 },
  ]

  const title = 'Донат | ' + seo.title

  return (
    <>
      <Head>
        <title>{title}</title>
        <MetaHeader customTitle="Донат" />
      </Head>

      <NavHeader className="bg-primary-100" />

      <Section className="bg-primary-100" id="header">
        <div className="text-center pt-14 lg:w-1/2 mx-auto">
          <h1>🍩 Донат</h1>

          <p className="pt-6">
            Мы хотим, чтобы менторство было доступно для всех. Поэтому наш проект — некоммерческий.
            Мы не берём денег ни с менторов, ни с учеников.
          </p>
          <p>
            Если вам близко, что мы делаем, поддержите нас донатом. Он поможет нам обслуживать
            сервера, оплачивать хостинги и развивать сайт 🍩
          </p>
        </div>
      </Section>

      <Section id="list">
        <Section.Title>Как донатить</Section.Title>

        <div className="flex flex-wrap justify-center items-center">
          {donates.map((donate) => (
            <a
              key={donate.name}
              className="rounded hover:bg-gray-100 h-20 px-8 flex justify-center items-center"
              href={donate.linkUrl}
              target="_blank"
              rel="noreferrer"
            >
              <Image
                src={donate.image.url}
                width={donate.image.width}
                height={donate.image.height}
              />
            </a>
          ))}
        </div>

        <div className="text-center">
          <p>
            Если ни один из способов не подходит —{' '}
            <a className="link" href="mailto:hello@getmentor.dev">
              напиши нам
            </a>
            . Что-нибудь придумаем.
          </p>
        </div>
      </Section>

      <Section className="bg-gray-100" id="patrons">
        <Section.Title>Нас поддерживают</Section.Title>

        <div className="text-center">
          <p>Эти люди поддерживают нас через Patreon. Спасибо им!</p>
        </div>

        {supporters.map((supporter) => (
          <div className="rounded-md shadow-md bg-white py-4 px-5 mb-5" key={supporter.name}>
            <div className="flex justify-between">
              <div>
                <h3 className="text-lg">{supporter.name}</h3>

                <div className="text-sm pt-1 text-gray-600">
                  Уровень:{' '}
                  <b>
                    {supporter.level === 2 && 'Стример'}
                    {supporter.level === 3 && 'Меценат 👑'}
                    {supporter.level === 4 && 'Мини-спонсор 💰'}
                  </b>
                </div>

                {supporter.level === 4 && (
                  <>
                    <div className="text-sm pt-1 text-gray-600">
                      <a href={supporter.url} target="_blank" rel="nofollow noreferrer">
                        {supporter.url}
                      </a>
                    </div>
                  </>
                )}
              </div>

              <div>{supporter.level > 1 ? <span>❤️🤟</span> : <span>❤️</span>}</div>
            </div>
          </div>
        ))}
      </Section>

      <Footer />
    </>
  )
}
