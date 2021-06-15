import { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faIdBadge, faInfo, faPaperPlane, faComments, faEdit, faSearch } from '@fortawesome/free-solid-svg-icons'
import NavHeader from '../components/NavHeader'
import Footer from '../components/Footer'
import MentorsFilters from '../components/MentorsFilters'
import MentorsList from '../components/MentorsList'
import { getMentors } from '../server/cached-mentors'
import Section from '../components/Section'
import config from '../config'

export async function getServerSideProps() {
  const allMentors = await getMentors()

  return {
    props: {
      allMentors,
    },
  }
}

export function Feature(props) {
  return (
    <div className="flex sm:w-1/2 lg:w-1/3 p-4">
      <div className="pr-4">
        <FontAwesomeIcon
          className="text-primary"
          icon={props.icon}
          size="2x"
          fixedWidth
        />
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-4">{props.title}</h3>
        <div>{props.text}</div>
      </div>
    </div>
  )
}

export function MentorsBlock(props) {
  const { allMentors } = props

  const [selectedTags, setSelectedTags] = useState([])
  const [mentorsCount, setMentorsCount] = useState(48)

  // reset pagination on filters change
  useEffect(() => {
    setMentorsCount(48)
  }, [selectedTags])

  const showMoreMentors = () => {
    setMentorsCount(mentorsCount + 48)
  }

  const hasAllTags = (mentorTags, selectedTags) => {
    for (const selectedTag of selectedTags) {
      if (!mentorTags.includes(selectedTag)) {
        return false
      }
    }
    return true
  }
  const filteredMentors = (selectedTags.length)
    ? allMentors.filter(mentor => hasAllTags(mentor.tags, selectedTags))
    : allMentors

  const mentors = filteredMentors.slice(0, mentorsCount)
  const hasMoreMentors = (filteredMentors.length > mentorsCount)

  return (
    <Section id="list">
      <Section.Title>Наши менторы</Section.Title>

      <MentorsFilters
        tags={selectedTags}
        onChange={newTags => setSelectedTags(newTags)}
      />

      <MentorsList
        mentors={mentors}
        hasMore={hasMoreMentors}
        onClickMore={() => showMoreMentors()}
      />
    </Section>
  )
}

export default function Home(props) {
  const { allMentors } = props

  return (
    <>
      <Head>
        <title>{config.seo.title}</title>
        <meta name="description" content={config.seo.description} />

        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={config.seo.title} />
        <meta name="twitter:description" content={config.seo.description} />
        <meta name="twitter:image.src" content={config.seo.imageUrl} />

        <meta name="og:site_name" content={config.seo.title} />
        <meta name="og:type" content="website" />
        <meta name="og:description" content={config.seo.description} />
        <meta name="og:image" content={config.seo.imageUrl} />
      </Head>

      <NavHeader />

      <Section className="bg-primary-100" id="header">
        <div className="text-center py-14 lg:w-3/4 mx-auto">
          <h1>Найди своего ментора</h1>

          <p>GetMentor&nbsp;— это открытое сообщество IT-наставников, готовых
            делиться своими знаниями и опытом.<br />
            Наша задача&nbsp;— помогать людям находить ответы на свои вопросы в работе или
            жизни через прямой доступ к экспертизе в разговоре 1-на-1.
          </p>

          <a className="button bg-primary-900 mt-6" href="#list">Найти ментора</a>
        </div>
      </Section>

      <Section id="howitworks">
        <Section.Title className="text-primary">Как это работает</Section.Title>

        <div className="flex flex-wrap">
          <Feature
            icon={faIdBadge}
            title="Ты выбираешь наставника из списка ниже"
            text="Все наши менторы выбраны вручную, чтобы исключить шарлатанство и спам."
          />

          <Feature
            icon={faInfo}
            title="У каждого ментора есть подробное описание, с чем он может помочь"
            text="А ещё есть пометки опыта: 🌟10+ лет, 😎5-10 лет, 👍2-5 лет. И цена за сессию."
          />

          <Feature
            icon={faEdit}
            title="Когда выбрал, оставляй заявку"
            text="Напиши подробно, какую помощь ищешь, чтобы ментор лучше понимал, как тебе помочь."
          />

          <Feature
            icon={faPaperPlane}
            title="Мы передадим твою информацию ментору"
            text="Почти мгновенно, как только отработает автоматизация."
          />

          <Feature
            icon={faComments}
            title="Ментор напишет тебе и обсудит все детали"
            text="Напрямую без посредников. Тут мы уже выходим из игры и оставляем вас наедине. Стоимость и способ оплаты — также на усмотрение ментора."
          />

          <Feature
            icon={faSearch}
            title="Не нашли, кого искали?"
            text="Оставь заявку на подбор ментора и наши специалисты вручную найдут наставника под твой запрос."
          />
        </div>
      </Section>

      <Section className="bg-gray-100" id="support">
        <Section.Title>Поддержать проект</Section.Title>

        <div className="flex justify-center items-center">
          <a
            className="border-0 px-4"
            href="https://www.patreon.com/getmentor"
            target="_blank"
            rel="noreferrer"
          >
            <img
              src="https://dl.airtable.com/.attachments/459c122afbca675d1172b0a198c176ab/d7bfca46/Digital-Patreon-Wordmark_FieryCoral.png"
              width="200px"
            />
          </a>

          <a
            className="border-0 px-4"
            href="https://www.tinkoff.ru/rm/mogelashvili.georgiy1/llaLa45003"
            target="_blank"
            rel="noreferrer"
          >
            <img
              src="https://dl.airtable.com/.attachments/39cd6946259ab35a8d8f8ecec995c325/f523c45c/tinkoff.png"
              width="200px"
            />
          </a>

          <a
            className="border-0 px-4"
            href="https://paypal.me/glamcoder"
            target="_blank"
            rel="noreferrer"
          >
            <img
              src="https://dl.airtable.com/.attachments/d671166bc047b43a9d897b5cbda5c336/fa2e91fe/paypal.png"
              width="200px"
            />
          </a>
        </div>
      </Section>

      <MentorsBlock allMentors={allMentors} />

      <Section className="bg-gray-100" id="sponsors">
        <Section.Title>Нас поддерживают</Section.Title>

        <div className="flex justify-center items-center">
          <a
            className="border-0 px-4"
            href="https://avito.tech"
            target="_blank"
            rel="noreferrer"
          >
            <img
              src="https://dl.airtable.com/.attachments/19f21846f5925e28a11e9447b286223c/db62e445/v2.png"
              width="300px"
            />
          </a>
        </div>

        <div className="text-center mt-4">
          <a
            href="https://www.notion.so/GetMentor-dev-1c6b882718154fc0961be132cab354a4"
            target="_blank"
            rel="noreferrer"
          >
            Стать нашим спонсором
          </a>
        </div>
      </Section>

      <Section id="donate">
        <Section.Title>🍩 Донат</Section.Title>

        <div className="text-center">
          <p>Поиск наставника&nbsp;— сложный процесс. Как минимум потому, что не понятно, а где же
            его надо искать. Абсолютно такой же сложный процесс&nbsp;— поиск учеников, если ты
            эксперт. Этот сайт был задуман как место, где люди, которым нужна помощь ментора, и
            специалисты, готовые делиться знаниями, могли найти друг друга.
          </p>

          <p>Наша главная задача&nbsp;— соединять людей и развивать коммьюнити за счёт новых
            знакомств и передачи знаний.<br/>
          <strong className="text-primary">За свою работу мы не берём никакой комиссии, оплаты за
              участие и прочих обязательных взносов и вознаграждений ни от менторов, ни от
              менти.</strong><br/>
            Мы верим в то, что если эта площадка приносит пользу людям, то они сами захотят
            отблагодарить нас за это.
          </p>

          <p>Поэтому у тебя есть возможность задонатить нам сколько ты хочешь. Сделать это
            довольно легко, вот <Link href="/donate">тут написано как</Link>.
          </p>

          <Link href="/donate">
            <a className="button bg-primary-900">Поблагодарить</a>
          </Link>
        </div>
      </Section>

      <Section className="bg-gray-100" id="addyourown">
        <Section.Title>Стать ментором</Section.Title>

        <div className="text-center">
          <p>У тебя есть опыт и ты хочешь делиться своими знаниями и помогать другим?
            {' '}
            <strong>Присоединяйся к нашей команде менторов!</strong>
          </p>

          <p>Заполни анкету и мы обязательно добавим тебя на сайт.</p>

          <Link href="/bementor">
            <a className="button bg-primary-900">Оставить заявку</a>
          </Link>
        </div>
      </Section>

      <Section id="faq">
        <Section.Title>FAQ</Section.Title>

        <h4 className="text-xl font-semibold mt-10">❓&nbsp;Зачем всё это?</h4>
        <p>Мы видим огромную потребность у современных специалистов в
          наставниках, которые помогали бы им преодолевать трудности и научили бы тонкостям и
          тайным знаниям. Этот сервис&nbsp;— попытка построить коммьюнити наставников и
          учеников, чтобы облегчить им поиск друг друга.
        </p>

        <h4 className="text-xl font-semibold mt-10">📅&nbsp;Я записался к ментору. Что теперь?</h4>
        <p>Отлично! Сразу после того, как ты оставил заявку на
          менторство, мы передаём её выбранному эксперту. Он или она рассмотрят её в течение
          пары дней. Если ментор решит, что готов помочь по этой заявке, то он сам свяжется с
          тобой для выбора времени и способа встречи.
        </p>
        <p>Однако может случиться такое, что ментор решит отказаться
          от заявки. Это не значит, что ты сделал что-то не так, просто у ментора может не быть
          времени или необходимой экспертизы. В этом случае мы обязательно оповестим тебя об
          отказе, чтобы ты мог найти себе другого специалиста.
        </p>

        <h4 className="text-xl font-semibold mt-10">💶&nbsp;Сколько это стоит?</h4>
        <p>Мы хотим построить сообщество, поэтому не хотим приплетать в
          процесс деньги. Однако мы понимаем, что время эксперта может чего-то стоить. Поэтому у
          нас каждый ментор сам назначает стоимость своей консультации, которую мы затем
          показываем на карточке. Эта цена носит рекомендательный характер и всегда обсуждается
          с экспертом напрямую.
        </p>
        <p>При этом наша площадка абсолютно ничего не берёт себе из
          этой цены. Если вы хотите поддержать проект и отблагодарить нас за работу, вы
          можете <Link href="/donate">сделать нам донат</Link>.
        </p>

        <h4 className="text-xl font-semibold mt-10">🚫&nbsp;Я не нашёл ментора. Что делать?</h4>
        <p>Так бывает, но не нужно расстраиваться. Ты можешь поделиться
          ссылкой на этот сайт в своих сетях, чтобы больше людей узнало о площадке и пришло сюда
          в качестве экспертов.
        </p>

        <h4 className="text-xl font-semibold mt-10">🙋‍♀️&nbsp;Как мне стать ментором?</h4>
        <p>Очень просто. Достаточно <Link href="/bementor">оставить заявку</Link>, и мы обязательно вас
          добавим.
        </p>

        <h4 className="text-xl font-semibold mt-10">👋&nbsp;У меня есть идеи. Куда писать?</h4>
        <p>Пишите <a href="mailto:hello@getmentor.dev">нам на почту</a>,
          мы с радостью почитаем и ответим.
        </p>
      </Section>

      <Footer />
    </>
  )
}
