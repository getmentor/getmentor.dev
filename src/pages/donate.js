import Head from 'next/head'
import NavHeader from '../components/NavHeader'
import Footer from '../components/Footer'
import Section from '../components/Section'
import seo from '../config/seo'
import donates from '../config/donates'
import Image from 'next/image'

export default function Donate() {
  const supporters = [
    { name: 'Михаил Князев', level: 3 },
    { name: 'Иван Круглов', level: 3 },
    { name: 'Artem Grygorenko', level: 2 },
    { name: 'Денис Бесков', level: 1 },
    { name: 'София Мамаева', level: 1 },
    { name: 'Денис Инешин', level: 1 },
    { name: 'Дмитрий Симонов', level: 1 },
    { name: 'Максим М.', level: 1 },
    { name: 'Ани Кочарян', level: 1 },
    { name: 'Роман Ивлиев', level: 1 },
    { name: 'Анастасия Калашникова', level: 1 },
    { name: 'Марина Коняева', level: 1 },
  ]

  return (
    <>
      <Head>
        <title>Донат | {seo.title}</title>
      </Head>

      <NavHeader className="bg-primary-100" />

      <Section className="bg-primary-100" id="header">
        <div className="text-center py-14 lg:w-3/4 mx-auto">
          <h1>🍩 Донат</h1>

          <p>
            Эта площадка полностью бесплатна для менторов и учеников. Мы не берём комиссий, взносов,
            обязательных платежей – ничего, что могло бы отвлекать людей от общения.
          </p>

          <p>
            Но это также значит, что поддержка сайта держится на энтузиазме и наших личных финансах.
            Чтобы этот энтузиазм и финансы не иссякали, ты можешь поблагодарить нас небольшим
            донатом. Из этих денег мы оплатим хостинги, подписки на всякие SaaS и прочие штуки, на
            чём тут всё держится.
          </p>

          <p>На оставшиеся деньги пойдём в кафе.</p>
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
          <p>Или можно на карту напрямую: 5536 9139 2661 4781.</p>
          <p>
            Если ни один из них не подходит, то{' '}
            <a className="link" href="mailto:georgiy@getmentor.dev">
              напиши нам
            </a>
            , мы что-нибудь придумаем.
          </p>
        </div>
      </Section>

      <Section className="bg-gray-100" id="patrons">
        <Section.Title>Нас поддерживают</Section.Title>

        <div className="text-center">
          <p>Эти люди поддержали нас через Patreon или вручную. Спасибо им!</p>
        </div>

        {supporters.map((supporter) => (
          <div className="rounded-md shadow-md bg-white py-4 px-5 mb-5" key={supporter.name}>
            <div className="flex justify-between">
              <div>
                <h3 className="text-lg">{supporter.name}</h3>

                {supporter.level === 3 && (
                  <div className="text-sm pt-1 text-gray-600">Меценат 👑</div>
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
