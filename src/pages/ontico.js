import Head from 'next/head'
import config from '../config'
import NavHeader from '../components/NavHeader'
import Section from '../components/Section'
import { getMentors } from '../server/cached-mentors'
import MentorsFilters from '../components/MentorsFilters'
import MentorsList from '../components/MentorsList'
import useMentorsByTags from '../components/useMentorsByTags'
import Footer from '../components/Footer'
import MentorsSearch from '../components/MentorsSearch'

export async function getServerSideProps() {
  const allMentors = await getMentors()

  const onticoMentors = allMentors
    .filter(mentor => mentor.tags.includes('Сообщество Онтико'))

  return {
    props: {
      onticoMentors,
    },
  }
}

function Feature({ title, text, imageUrl }) {
  return (
    <div className="flex sm:w-1/2 lg:w-1/3 p-4">
      <div className="pr-4">
        <img
          src={imageUrl}
          className="w-40"
        />
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-4">{title}</h3>
        <div>{text}</div>
      </div>
    </div>
  )
}

export default function Ontico({ onticoMentors }) {
  const [
    mentors,
    searchInput,
    selectedTags,
    hasMoreMentors,
    setSearchInput,
    setSelectedTags,
    showMoreMentors,
  ] = useMentorsByTags(onticoMentors)

  return (
    <>
      <Head>
        <title>Конференции Онтико | {config.seo.title}</title>
      </Head>

      <NavHeader />

      <Section className="bg-primary-100" id="header">
        <div className="text-center py-14 lg:w-3/4 mx-auto">
          <h1>Создаем профессиональное пространство для встречи и обмена опыта представителей IT индустрии</h1>
        </div>
      </Section>

      <Section>
        <div className="text-center" id="description">
          <p>Компания Онтико делает профессиональные конференции с 2007 года. Нашей главной
            ценностью является выдающийся опыт участников наших конференций — разработчиков,
            тимлидов, техлидов, технических директоров, собственников ИТ-компаний — всех тех, кто
            сегодня делает цифровую экономику.
          </p>

          <p>Мы достигаем это через предоставление новейшего актуального контента, высочайшего
            качества организации, огромного количества разнообразных активностей на конференции, чтобы
            каждый участник наших событий получил знания в соответствии с индивидуальным запросом и
            заряд энергии для получения максимальной пользы и создания собственных результатов.
          </p>
        </div>
      </Section>

      <Section id="howitworks">
        <div className="flex flex-wrap">
          <Feature
            title="Конференции"
            text="Более 50 конференций"
            imageUrl="https://dl.airtable.com/.attachments/a372ca40ab8d5407d9a215fdad23baad/41841dcd/Icons-01.png"
          />

          <Feature
            title="Участники"
            text="Более 50 конференций"
            imageUrl="https://dl.airtable.com/.attachments/81e7479c0d8caa0a54e9bad068693bba/1e367350/Icons-02.png"
          />

          <Feature
            title="Спикеры"
            text="Более 40 000 участников"
            imageUrl="https://dl.airtable.com/.attachments/438dd1569af1535542ce8ffcededc647/f92ec701/Icons-03.png"
          />
        </div>
      </Section>

      <Section id="list">
        <Section.Title>Наши менторы</Section.Title>

        <div className="text-center">
          <p>На конференциях Онтико мы собираем большое число экспертов из разных областей, которые
            делятся с участниками своим опытом и лайфхаками. Сейчас вам не обязательно ждать
            очередной конференции  - вы можете записаться на консультацию у нужного эксперта прямо
            сейчас.
          </p>
        </div>

        <div className="mb-6">
          <MentorsSearch
            value={searchInput}
            onChange={setSearchInput}
          />
        </div>

        <div className="mb-8">
          <MentorsFilters
            tags={selectedTags}
            onChange={setSelectedTags}
            allowSponsors={false}
          />
        </div>

        <MentorsList
          mentors={mentors}
          hasMore={hasMoreMentors}
          onClickMore={() => showMoreMentors()}
        />
      </Section>

      <Section id="calendar">
        <Section.Title>Календарь конференций</Section.Title>

        <div className="text-center">
          <a className="button bg-primary-900" target="_blank" href="https://conf.ontico.ru/" rel="noreferrer">Все наши конференции</a>
        </div>
      </Section>

      <Footer />
    </>
  )
}
