import Head from 'next/head'
import Image from 'next/image'
import seo from '../config/seo'
import NavHeader from '../components/NavHeader'
import Section from '../components/Section'
import { getMentors } from '../server/cached-mentors'
import MentorsFilters from '../components/MentorsFilters'
import MentorsList from '../components/MentorsList'
import useMentors from '../components/useMentors'
import Footer from '../components/Footer'
import MentorsSearch from '../components/MentorsSearch'

export async function getServerSideProps() {
  const allMentors = await getMentors()

  const pageMentors = allMentors
    .filter((mentor) => mentor.isVisible)
    .filter((mentor) => mentor.tags.includes('Сообщество Онтико'))

  return {
    props: {
      pageMentors,
    },
  }
}

const photos = [
  'https://res.cloudinary.com/getmentor-dev/image/upload/v1624463026/ontico/19-04-09_13-30_0145_bqhq6l.jpg',
  'https://res.cloudinary.com/getmentor-dev/image/upload/v1624463000/ontico/21-04-30_10-41_0029_dnfuik.jpg',
  'https://res.cloudinary.com/getmentor-dev/image/upload/v1624462999/ontico/21-04-30_11-13_0044_gzigmv.jpg',
  'https://res.cloudinary.com/getmentor-dev/image/upload/v1624462942/ontico/2019-11-07_10-33_0076_VI_cxage5.jpg',
  'https://res.cloudinary.com/getmentor-dev/image/upload/v1624462830/ontico/19-11-07_10-29_0528_SK_lazjux.jpg',
  'https://res.cloudinary.com/getmentor-dev/image/upload/v1624462829/ontico/11-22_20-02-10_0139_nsdxbp.jpg',
  'https://res.cloudinary.com/getmentor-dev/image/upload/v1624462828/ontico/19-09-23_16-22_0677_avktxz.jpg',
  'https://res.cloudinary.com/getmentor-dev/image/upload/v1624462828/ontico/21-05-17_10-52_0403_A_rafyhx.jpg',
  'https://res.cloudinary.com/getmentor-dev/image/upload/v1624462828/ontico/21-05-17_10-03_0186_A_gldji4.jpg',
  'https://res.cloudinary.com/getmentor-dev/image/upload/v1624462828/ontico/21-05-17_11-15_0270_L_tlth2r.jpg',
  'https://res.cloudinary.com/getmentor-dev/image/upload/v1624462827/ontico/21-05-17_11-18_0272_L_r6xmvm.jpg',
  'https://res.cloudinary.com/getmentor-dev/image/upload/v1624462827/ontico/21-05-17_11-20_0277_A_xhzqhy.jpg',
  'https://res.cloudinary.com/getmentor-dev/image/upload/v1624462827/ontico/21-05-17_11-39_0286_L_ajcm7o.jpg',
  'https://res.cloudinary.com/getmentor-dev/image/upload/v1624462827/ontico/21-05-17_12-09_0326_A_u6yi9x.jpg',
  'https://res.cloudinary.com/getmentor-dev/image/upload/v1624462826/ontico/21-05-17_16-41_0513_L_wwcf7u.jpg',
  'https://res.cloudinary.com/getmentor-dev/image/upload/v1624462827/ontico/21-05-17_18-30_0599_L_k7ubvc.jpg',
  'https://res.cloudinary.com/getmentor-dev/image/upload/v1624462826/ontico/21-05-17_15-50_0469_L_le7xzl.jpg',
  'https://res.cloudinary.com/getmentor-dev/image/upload/v1624462826/ontico/21-05-17_17-57_0578_L_i6qi2u.jpg',
  'https://res.cloudinary.com/getmentor-dev/image/upload/v1624462826/ontico/21-05-17_17-39_0569_L_gnjule.jpg',
  'https://res.cloudinary.com/getmentor-dev/image/upload/v1624462826/ontico/21-06-01_10-13_0013_pd15th.jpg',
]

function Feature({ title, text, imageUrl }) {
  return (
    <div className="text-center p-4">
      <img className="inline w-40" src={imageUrl} />
      <p>{text}</p>
    </div>
  )
}

export default function Ontico({ pageMentors }) {
  const [
    mentors,
    searchInput,
    selectedTags,
    hasMoreMentors,
    setSearchInput,
    setSelectedTags,
    showMoreMentors,
  ] = useMentors(pageMentors)

  return (
    <>
      <Head>
        <title>Конференции Онтико | {seo.title}</title>

        <meta
          name="description"
          content="Создаем профессиональное пространство для встречи и обмена опыта представителей IT индустрии"
        />

        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={'Конференции Онтико | ' + seo.title} />
        <meta
          name="twitter:description"
          content="Создаем профессиональное пространство для встречи и обмена опыта представителей IT индустрии"
        />

        <meta name="og:site_name" content={'Конференции Онтико | ' + seo.title} />
        <meta name="og:type" content="website" />
        <meta
          name="og:description"
          content="Создаем профессиональное пространство для встречи и обмена опыта представителей IT индустрии"
        />
      </Head>

      <NavHeader />

      <Section id="header">
        <div className="py-14 max-w-screen-lg mx-auto">
          <h1 className="-ml-3">
            <Image src="/images/ontico.png" alt="Онтико" width={400} height={(400 / 1024) * 220} />
          </h1>

          <p className="text-3xl leading-relaxed">
            Создаем профессиональное пространство для встречи и обмена опыта представителей IT
            индустрии
          </p>

          <p className="text-3xl text-right font-light">уже 15 лет :)</p>

          <a
            className="button bg-primary-900 mt-6"
            href="https://conf.ontico.ru/"
            rel="noreferrer"
            target="_blank"
          >
            Наши конференции
          </a>
        </div>
      </Section>

      <Section id="description">
        <div className="grid lg:grid-cols-2 gap-8 max-w-screen-lg	mx-auto">
          <div>
            <Image
              src="https://res.cloudinary.com/getmentor-dev/image/upload/v1624462829/ontico/19-09-23_16-19_0674_hcqqsy.jpg"
              width={550}
              height={(1440 / 2160) * 550}
              layout="responsive"
              unoptimized={true}
            />
          </div>

          <div className="prose">
            <p>
              Компания Онтико делает профессиональные конференции с 2007 года. Нашей главной
              ценностью является выдающийся опыт участников наших конференций — разработчиков,
              тимлидов, техлидов, технических директоров, собственников ИТ-компаний — всех тех, кто
              сегодня делает цифровую экономику.
            </p>

            <p>
              Мы достигаем это через предоставление новейшего актуального контента, высочайшего
              качества организации, огромного количества разнообразных активностей на конференции,
              чтобы каждый участник наших событий получил знания в соответствии с индивидуальным
              запросом и заряд энергии для получения максимальной пользы и создания собственных
              результатов.
            </p>
          </div>
        </div>
      </Section>

      <Section id="howitworks">
        <div className="flex flex-wrap justify-around max-w-screen-lg -my-10 mx-auto">
          <Feature
            text="Более 50 конференций"
            imageUrl="https://dl.airtable.com/.attachments/a372ca40ab8d5407d9a215fdad23baad/41841dcd/Icons-01.png"
          />

          <Feature
            text="Более 3 000 докладчиков"
            imageUrl="https://dl.airtable.com/.attachments/81e7479c0d8caa0a54e9bad068693bba/1e367350/Icons-02.png"
          />

          <Feature
            text="Более 40 000 участников"
            imageUrl="https://dl.airtable.com/.attachments/438dd1569af1535542ce8ffcededc647/f92ec701/Icons-03.png"
          />
        </div>
      </Section>

      <Section>
        <div className="grid grid-cols-5 gap-4 mb-6">
          {photos.map((photoUrl) => (
            <div className="relative aspect-w-3 aspect-h-2" key={photoUrl}>
              <Image src={photoUrl} layout="fill" unoptimized={true} />
            </div>
          ))}
        </div>
      </Section>

      <Section>
        <div className="grid lg:grid-cols-2 gap-8 max-w-screen-lg	mx-auto mb-6">
          <div className="prose">
            <p>
              На конференциях Онтико мы собираем большое число экспертов из разных областей, которые
              делятся с участниками своим опытом и лайфхаками. Сейчас вам не обязательно ждать
              очередной конференции - вы можете записаться на консультацию у нужного эксперта прямо
              сейчас.
            </p>
          </div>

          <div>
            <Image
              src="https://res.cloudinary.com/getmentor-dev/image/upload/v1624462826/ontico/21-05-17_17-03_0534_L_sj335b.jpg"
              width={550}
              height={(1333 / 2000) * 550}
              layout="responsive"
              unoptimized={true}
            />
          </div>
        </div>
      </Section>

      <Section id="list">
        <Section.Title>Наши менторы</Section.Title>

        <div className="mb-6">
          <MentorsSearch value={searchInput} onChange={setSearchInput} />
        </div>

        <div className="mb-8">
          <MentorsFilters tags={selectedTags} onChange={setSelectedTags} allowSponsors={false} />
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
          <a
            className="button bg-primary-900"
            target="_blank"
            href="https://conf.ontico.ru/"
            rel="noreferrer"
          >
            Все наши конференции
          </a>
        </div>
      </Section>

      <Footer />
    </>
  )
}
