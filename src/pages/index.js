import Head from 'next/head'
import Link from 'next/link'
import Image from 'next/image'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faIdBadge, faComments, faEdit } from '@fortawesome/free-solid-svg-icons'
import { getAllMentors } from '../server/mentors-data'
import NavHeader from '../components/NavHeader'
import Footer from '../components/Footer'
import MentorsFilters from '../components/MentorsFilters'
import MentorsList from '../components/MentorsList'
import MentorsSearch from '../components/MentorsSearch'
import Section from '../components/Section'
import useMentors from '../components/useMentors'
import donates from '../config/donates'
import { useEffect } from 'react'
import analytics from '../lib/analytics'
import MetaHeader from '../components/MetaHeader'
import seo from '../config/seo'
import VisibilitySensor from 'react-visibility-sensor'

export async function getServerSideProps(context) {
  const pageMentors = await getAllMentors({ onlyVisible: true })
  return {
    props: {
      pageMentors,
    },
  }
}

function Feature(props) {
  return (
    <div className="flex sm:w-1/2 lg:w-1/3 p-4">
      <div className="pr-4">
        <FontAwesomeIcon className="text-primary" icon={props.icon} size="2x" fixedWidth />
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-4">{props.title}</h3>
        <div>{props.text}</div>
        <br />
        <div>{props.subline}</div>
      </div>
    </div>
  )
}

function onSponsorsShown(isVisible) {
  if (isVisible) analytics.event('Sponsors Banner Shown')
}

export default function Home({ pageMentors }) {
  const [mentors, searchInput, hasMoreMentors, setSearchInput, showMoreMentors, appliedFilters] =
    useMentors(pageMentors)
  useEffect(() => {
    analytics.event('Visit Index Page')
  }, [])

  return (
    <>
      <Head>
        <title>{seo.title}</title>
        <MetaHeader />
      </Head>

      <NavHeader className="bg-primary-100" />

      <Section className="bg-primary-100" id="header">
        <div className="text-center py-14 lg:w-3/4 mx-auto">
          <h1>Найди своего ментора</h1>

          <p className="lg:w-3/4 mx-auto">
            GetMentor&nbsp;— это открытое сообщество IT-наставников, готовых делиться знаниями и
            опытом.
            <br />
            <br />
            Правильный разговор прояснит ситуацию лучше, чем десять часов поисков в интернете.
            Поэтому мы помогаем тем, кому нужен совет, найти человека с экспертизой и обсудить свой
            вопрос один на один.
          </p>

          <a className="button bg-primary-900 mt-6" href="#list">
            Найти ментора
          </a>
        </div>
      </Section>

      <Section id="howitworks">
        <Section.Title className="text-primary">Как это работает</Section.Title>

        <div className="flex flex-wrap">
          <Feature
            icon={faIdBadge}
            title="Выбери ментора"
            text="С нами работают 500+ специалистов из Авито, Яндекса, Google и других компаний. Можешь выбрать нужного человека по специальности, опыту работы и стоимости встречи."
            subline="Всех менторов мы проверяем сами: никакого шарлатанства."
          />

          <Feature
            icon={faEdit}
            title="Напиши ему"
            text="Оставь заявку на сайте. Напиши, с чем тебе нужна помощь и что бы ты хотел получить."
            subline="Помни: хорошо сформулированная проблема — наполовину решённая проблема. Чем подробнее опишешь, тем лучше."
          />

          <Feature
            icon={faComments}
            title="Дело за вами"
            text="Мы перешлём твою заявку ментору. Он оценит задачу и свяжется с тобой, чтобы обсудить детали и выбрать время. Каждый ментор сам определяет стоимость и длительность сессии."
            subline="Тут мы не вмешиваемся — дело за вами."
          />
        </div>
      </Section>

      <Section className="bg-gray-100" id="support">
        <Section.Title>Поддержать проект</Section.Title>

        <div className="flex flex-wrap justify-center items-center">
          {donates.map((donate) => (
            <a
              key={donate.name}
              className="h-20 px-8 flex justify-center items-center"
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

        <div className="text-center mt-4">
          <Link href="/donate">
            <a className="link">Почему это важно</a>
          </Link>
        </div>
      </Section>

      <Section id="list">
        <Section.Title>Наши менторы</Section.Title>

        <div className="mb-6 md:flex">
          <div className="w-full">
            <MentorsSearch value={searchInput} onChange={setSearchInput} />
          </div>
        </div>

        <div className="mb-8">
          <MentorsFilters appliedFilters={appliedFilters} />
        </div>

        <MentorsList
          mentors={mentors}
          hasMore={hasMoreMentors}
          onClickMore={() => showMoreMentors()}
        />
      </Section>

      <Section className="bg-gray-100" id="sponsors">
        <VisibilitySensor onChange={onSponsorsShown}>
          <Section.Title>Нас поддерживают</Section.Title>
        </VisibilitySensor>

        <div className="flex justify-center items-center">
          <a
            className="h-20 px-8 pt-1 flex justify-center items-center"
            href="https://avito.tech"
            target="_blank"
            rel="noreferrer"
          >
            <Image src="/images/avito_tech.png" width={300} height={100} />
          </a>

          <Link href="/ontico">
            <div className="h-20 px-8 flex justify-center items-center">
              <Image src="/images/ontico.png" width={300} height={(220 / 1024) * 300} />
            </div>
          </Link>

          <a
            className="h-20 px-8 pt-1 flex justify-center items-center"
            href="http://psyvit.ru/?utm_source=getmentor&utm_medium=banner&utm_campaign=sait"
            target="_blank"
            rel="noreferrer"
          >
            <Image src="/images/psyvit.png" width={300} height={100} />
          </a>
        </div>

        <div className="text-center mt-4">
          <a
            className="link"
            href="https://glamcoder.notion.site/GetMentor-dev-1c6b882718154fc0961be132cab354a4"
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
          <p>
            Поиск наставника&nbsp;— сложный процесс. Как минимум потому, что не понятно, а где же
            его надо искать. Абсолютно такой же сложный процесс&nbsp;— поиск учеников, если ты
            эксперт. Этот сайт был задуман как место, где люди, которым нужна помощь ментора, и
            специалисты, готовые делиться знаниями, могли найти друг друга.
          </p>

          <p>
            Наша главная задача&nbsp;— соединять людей и развивать комьюнити за счёт новых знакомств
            и передачи знаний.
            <br />
            <strong className="text-primary">
              За свою работу мы не берём никакой комиссии, оплаты за участие и прочих обязательных
              взносов и вознаграждений ни от менторов, ни от менти.
            </strong>
            <br />
            Мы верим в то, что если эта площадка приносит пользу людям, то они сами захотят
            отблагодарить нас за это.
          </p>

          <p>
            Поэтому у тебя есть возможность задонатить нам сколько ты хочешь. Сделать это довольно
            легко, вот{' '}
            <Link href="/donate">
              <div className="link">тут написано как</div>
            </Link>
            .
          </p>

          <Link href="/donate">
            <div className="button bg-primary-900">Поблагодарить</div>
          </Link>
        </div>
      </Section>

      <Section className="bg-gray-100" id="addyourown">
        <Section.Title>Стать ментором</Section.Title>

        <div className="text-center">
          <p>
            У тебя есть опыт и ты хочешь делиться своими знаниями и помогать другим?{' '}
            <strong>Присоединяйся к нашей команде менторов!</strong>
          </p>

          <p>Заполни анкету и мы обязательно добавим тебя на сайт.</p>

          <Link href="/bementor">
            <div className="button bg-primary-900">Оставить заявку</div>
          </Link>
        </div>
      </Section>

      <Section id="faq">
        <Section.Title>FAQ</Section.Title>

        <div className="prose max-w-none">
          <h3>❓&nbsp;Зачем всё это?</h3>
          <p>
            Мы видим огромную потребность у современных специалистов в наставниках, которые помогали
            бы им преодолевать трудности и научили бы тонкостям и тайным знаниям. Этот сервис&nbsp;—
            попытка построить комьюнити наставников и учеников, чтобы облегчить им поиск друг друга.
          </p>

          <h3>📅&nbsp;Я записался к ментору. Что теперь?</h3>
          <p>
            Отлично! Сразу после того, как ты оставил заявку на менторство, мы передаём её
            выбранному эксперту. Он или она рассмотрят её в течение пары дней. Если ментор решит,
            что готов помочь по этой заявке, то он сам свяжется с тобой для выбора времени и способа
            встречи.
          </p>
          <p>
            Однако может случиться такое, что ментор решит отказаться от заявки. Это не значит, что
            ты сделал что-то не так, просто у ментора может не быть времени или необходимой
            экспертизы. В этом случае мы обязательно оповестим тебя об отказе, чтобы ты мог найти
            себе другого специалиста.
          </p>

          <h3>💶&nbsp;Сколько это стоит?</h3>
          <p>
            Мы хотим построить сообщество, поэтому не хотим приплетать в процесс деньги. Однако мы
            понимаем, что время эксперта может чего-то стоить. Поэтому у нас каждый ментор сам
            назначает стоимость своей консультации, которую мы затем показываем на карточке. Эта
            цена носит рекомендательный характер и всегда обсуждается с экспертом напрямую.
          </p>
          <p>
            При этом наша площадка абсолютно ничего не берёт себе из этой цены. Если вы хотите
            поддержать проект и отблагодарить нас за работу, вы можете{' '}
            <Link href="/donate">сделать нам донат</Link>.
          </p>

          <h3>🚫&nbsp;Я не нашёл ментора. Что делать?</h3>
          <p>
            Так бывает, но не нужно расстраиваться. Ты можешь поделиться ссылкой на этот сайт в
            своих сетях, чтобы больше людей узнало о площадке и пришло сюда в качестве экспертов.
          </p>

          <h3>🙋‍♀️&nbsp;Как мне стать ментором?</h3>
          <p>
            Очень просто. Достаточно <Link href="/bementor">оставить заявку</Link>, и мы обязательно
            вас добавим.
          </p>

          <h3>👋&nbsp;У меня есть идеи. Куда писать?</h3>
          <p>
            Пишите <a href="mailto:hello@getmentor.dev">нам на почту</a>, мы с радостью почитаем и
            ответим.
          </p>
        </div>
      </Section>

      <Footer />
    </>
  )
}
