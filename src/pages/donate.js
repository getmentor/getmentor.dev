import Head from 'next/head'
import NavHeader from '../components/NavHeader'
import Footer from '../components/Footer'

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
    <div>
      <Head>
        <title>Донат | GetMentor – открытое сообщество IT-наставников</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <NavHeader />

      <section data-section="header" className="banner banner--default">
        <div className="container">
          <div className="banner__inner">
            <div className="row">
              <div className="column banner__content">
                <h1>🍩 Донат</h1>

                <p>
                  Эта площадка полностью бесплатна для менторов и учеников.
                  Мы не берём коммиссий, взносов, обязательных платежей – ничего, что могло бы
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
            </div>
          </div>
        </div>

      </section>

      <section className="section" data-section="list">
        <a name="list"></a>
        <div className="container">
          <h2 className="section__title">Как донатить</h2>
          <div className="section__description text-center">
            <p>
              Три простых способа – Patreon, перевод на карту или PayPal. Выбирай тот, который тебе
              удобнее. Или можно на карту напрямую: 5536 9139 2661 4781.<br/>
                Если ни один из них не подходит, то <a href="mailto:georgiy@getmentor.dev">напиши
                нам</a>, мы что-нибудь придумаем.
            </p>
          </div>

          <div className="section__content">
            <div className="cards">
              <div className="cards__wrapper per-row--3">
                {donates.map(donate => (
                  <div className="card card__image-only has_hover" key={donate.name}>
                    <div className="card__inner">
                      <div
                        className="card__header"
                        style={{ backgroundImage: 'url(' + donate.imageUrl + ')' }}
                      >
                        <div className="card__content">
                          <h4 className="card__title text-xl">{donate.name}</h4>
                          <p className="card__description">{donate.description}</p>
                        </div>
                        <div className="card__header_overlay" style={{ background: 'rgba(0,0,0,0.4)' }}></div>
                      </div>
                      <a
                        className="card__link"
                        href={donate.linkUrl}
                        target="_blank"
                        rel="noreferrer"
                      ></a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section" data-section="patrons">
        <a name="patrons"></a>

        <div className="container">
          <h2 className="section__title">Нас поддерживают</h2>
          <div className="section__description text-center">
            <p>Эти люди поддержали нас через Patreon или вручную. Спасибо им!</p>
          </div>
          <div className="section__content">
            <div className="list">
              <div className="list_items__wrapper">
                {supporters.map(supporter => (
                  <div className="list_item" key={supporter.name}>
                    <div className="list_item__inner bg-white">
                      <div className="list_item__row">
                        <div className="list_item__content">
                          <h5 className="list_item__title text-lg">{supporter.name}</h5>

                          {(supporter.level === 3) && (
                            <p className="list_item__description">Меценат 👑</p>
                          )}
                        </div>

                        <div className="list_item__right">
                          {(supporter.level > 1) ? (
                            <span>❤️🤟</span>
                          ) : (
                            <span>❤️</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section" data-section="list2">
        <a name="list2"></a>

        <div className="container">
          <h2 className="section__title">❗Это важно</h2>
          <div className="section__description text-center">
            <p>
              Проект держится исключительно на энтузиазме и доброй воле, а ими, как известно, счета
              не оплатишь.<br/>Поэтому твоя помощь очень важна для нас!
            </p>
          </div>

          <div className="section__content">
            <div className="cards">
              <div className="cards__wrapper per-row--3">
                {donates.map(donate => (
                  <div className="card card__image-only has_hover" key={donate.name}>
                    <div className="card__inner">
                      <div
                        className="card__header"
                        style={{ backgroundImage: 'url(' + donate.imageUrl + ')' }}
                      >
                        <div className="card__content">
                          <h4 className="card__title text-xl">{donate.name}</h4>
                          <p className="card__description">{donate.description}</p>
                        </div>
                        <div className="card__header_overlay" style={{ background: 'rgba(0,0,0,0.4)' }}></div>
                      </div>
                      <a
                        className="card__link"
                        href={donate.linkUrl}
                        target="_blank"
                        rel="noreferrer"
                      ></a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
