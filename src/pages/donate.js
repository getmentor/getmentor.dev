import Head from 'next/head'
import NavHeader from '../components/NavHeader'
import Footer from '../components/Footer'
import Section from '../components/Section'
import { Card } from '../components/Card'
import config from '../config'

export default function Donate() {
  const donates = [
    {
      name: 'Patreon',
      description: 'Донатить через Patreon',
      imageUrl: 'https://dl.airtable.com/.attachments/24433b517415d9a046694246ca40486a/61d80b5f/patreon.jpg',
      linkUrl: 'https://www.patreon.com/getmentor',
    },
    {
      name: 'Tinkoff',
      description: 'Перевод на карту',
      imageUrl: 'https://dl.airtable.com/.attachments/ddf7a481c48007e1b5064753f3db3236/29648357/512x512bb.jpg',
      linkUrl: 'https://www.tinkoff.ru/rm/mogelashvili.georgiy1/llaLa45003',
    },
    {
      name: 'Paypal',
      description: 'Оплатить через PayPal',
      imageUrl: 'https://dl.airtable.com/.attachments/1e2b02c5c4dd5ee67ab346f29bd54857/bed675ef/Paypal_2014_logo.png',
      linkUrl: 'https://paypal.me/glamcoder',
    },
  ]

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
        <title>Донат | {config.seo.title}</title>
      </Head>

      <NavHeader />

      <Section className="bg-primary-100" id="header">
        <div className="text-center py-14 lg:w-3/4 mx-auto">
          <h1>🍩 Донат</h1>

          <p>
            Эта площадка полностью бесплатна для менторов и учеников.
            Мы не берём комиссий, взносов, обязательных платежей – ничего, что могло бы
            отвлекать людей от общения.
          </p>

          <p>
            Но это также значит, что поддержка сайта держится на энтузиазме и наших личных
            финансах. Чтобы этот энтузиазм и финансы не иссякали, ты можешь поблагодарить нас
            небольшим донатом. Из этих денег мы оплатим хостинги, подписки на всякие SaaS и
            прочие штуки, на чём тут всё держится.
          </p>

          <p>На остаток купим пива 🍻</p>
        </div>
      </Section>

      <Section id="list">
        <Section.Title>Как донатить</Section.Title>

        <div className="text-center">
          <p>
            Три простых способа – Patreon, перевод на карту или PayPal. Выбирай тот, который тебе
            удобнее. Или можно на карту напрямую: 5536 9139 2661 4781.<br/>
            Если ни один из них не подходит, то <a href="mailto:georgiy@getmentor.dev">напиши
            нам</a>, мы что-нибудь придумаем.
          </p>
        </div>

        <div className="flex">
          {donates.map(donate => (
            <div className="md:w-1/3" key={donate.name}>
              <Card
                key={donate.name}
                linkUrl={donate.linkUrl}
                imageUrl={donate.imageUrl}
              >
                <div className="text-xl">{donate.name}</div>
                <p>{donate.description}</p>
              </Card>
            </div>
          ))}
        </div>
      </Section>

      <Section className="bg-gray-100" id="patrons">
        <Section.Title>Нас поддерживают</Section.Title>

        <div className="text-center">
          <p>Эти люди поддержали нас через Patreon или вручную. Спасибо им!</p>
        </div>

        {supporters.map(supporter => (
          <div className="rounded-md shadow-md bg-white py-4 px-5 mb-5"  key={supporter.name}>
            <div className="flex justify-between">
              <div>
                <h3 className="text-lg">{supporter.name}</h3>

                {(supporter.level === 3) && (
                  <div className="text-sm pt-1 text-gray-600">Меценат 👑</div>
                )}
              </div>

              <div>
                {(supporter.level > 1) ? (
                  <span>❤️🤟</span>
                ) : (
                  <span>❤️</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </Section>

      <Section id="list2">
        <Section.Title className="section__title">❗Это важно</Section.Title>

        <div className="text-center">
          <p>
            Проект держится исключительно на энтузиазме и доброй воле, а ими, как известно, счета
            не оплатишь.<br/>Поэтому твоя помощь очень важна для нас!
          </p>
        </div>

        <div className="flex">
          {donates.map(donate => (
            <div className="md:w-1/3" key={donate.name}>
              <Card
                key={donate.name}
                linkUrl={donate.linkUrl}
                imageUrl={donate.imageUrl}
              >
                <div className="text-xl">{donate.name}</div>
                <p>{donate.description}</p>
              </Card>
            </div>
          ))}
        </div>
      </Section>

      <Footer />
    </>
  )
}
