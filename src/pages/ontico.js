import Head from 'next/head'
import Image from 'next/image'
import classNames from 'classnames'
import cloudinary from '../lib/cloudinary'
import seo from '../config/seo'
import NavHeader from '../components/NavHeader'
import Section from '../components/Section'
import { getAllMentors } from '../server/mentors-data'
import MentorsFilters from '../components/MentorsFilters'
import MentorsList from '../components/MentorsList'
import useMentors from '../components/useMentors'
import Footer from '../components/Footer'
import MentorsSearch from '../components/MentorsSearch'
import MetaHeader from '../components/MetaHeader'
import analytics from '../lib/analytics'
import { useEffect } from 'react'

export async function getServerSideProps(context) {
  const allMentors = await getAllMentors({ onlyVisible: true })

  const pageMentors = allMentors.filter((mentor) => mentor.tags.includes('Сообщество Онтико'))

  return {
    props: {
      pageMentors,
    },
  }
}

const ontico_landing_url =
  'https://ontico.ru/?utm_source=getmentor&utm_medium=cpc&utm_campaign=landing'

const pageDescription =
  'Создаем профессиональное пространство для встречи и обмена опыта представителей IT индустрии'

const galleryPhotos = [
  'ontico/19-04-09_13-30_0145_bqhq6l.jpg',
  'ontico/21-04-30_10-41_0029_dnfuik.jpg',
  'ontico/21-04-30_11-13_0044_gzigmv.jpg',
  'ontico/2019-11-07_10-33_0076_VI_cxage5.jpg',
  'ontico/19-11-07_10-29_0528_SK_lazjux.jpg',
  'ontico/11-22_20-02-10_0139_nsdxbp.jpg',
  'ontico/19-09-23_16-22_0677_avktxz.jpg',
  'ontico/21-05-17_10-52_0403_A_rafyhx.jpg',
  'ontico/21-05-17_10-03_0186_A_gldji4.jpg',
  'ontico/21-05-17_11-15_0270_L_tlth2r.jpg',
  'ontico/21-05-17_11-18_0272_L_r6xmvm.jpg',
  'ontico/21-05-17_11-20_0277_A_xhzqhy.jpg',
  'ontico/21-05-17_11-39_0286_L_ajcm7o.jpg',
  'ontico/21-05-17_12-09_0326_A_u6yi9x.jpg',
  'ontico/21-05-17_16-41_0513_L_wwcf7u.jpg',
  'ontico/21-05-17_18-30_0599_L_k7ubvc.jpg',
  'ontico/21-05-17_15-50_0469_L_le7xzl.jpg',
  'ontico/21-05-17_17-57_0578_L_i6qi2u.jpg',
  'ontico/21-05-17_17-39_0569_L_gnjule.jpg',
  'ontico/21-06-01_10-13_0013_pd15th.jpg',
]

function Feature({ title, text, imageUrl }) {
  return (
    <div className="text-center p-4">
      <Image className="inline w-40" src={imageUrl} />
      <p>{text}</p>
    </div>
  )
}

export default function Ontico({ pageMentors }) {
  const [mentors, searchInput, hasMoreMentors, setSearchInput, showMoreMentors, appliedFilters] =
    useMentors(pageMentors)

  useEffect(() => {
    analytics.event('Visit Ontico Page')
  }, [])

  const title = 'Конференции Онтико | ' + seo.title

  return (
    <>
      <Head>
        <title>{title}</title>
        <MetaHeader customTitle="Конференции Онтико" customDescription={pageDescription} />
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

          <p className="text-3xl lg:text-right font-light">уже 15 лет :)</p>

          <a
            className="button bg-primary-900 mt-6"
            href={ontico_landing_url}
            target="_blank"
            rel="noreferrer"
          >
            Наши конференции
          </a>
        </div>
      </Section>

      <Section id="description">
        <div className="grid lg:grid-cols-2 gap-8 max-w-screen-lg	mx-auto">
          <div className="text-center">
            <Image
              src="ontico/19-09-23_16-19_0674_hcqqsy.jpg"
              width={550}
              height={(1333 / 2000) * 550}
              loader={({ src, width, quality }) => {
                return cloudinary.url(src, { width })
              }}
              placeholder="blur"
              blurDataURL={cloudinary.url('ontico/19-09-23_16-19_0674_hcqqsy.jpg', {
                width: 100,
                blur: 400,
              })}
            />
          </div>

          <div className="prose mx-auto">
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
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
          {galleryPhotos.map((photoUrl, index) => (
            <div
              key={photoUrl}
              className={classNames({
                hidden: index >= 10,
                'sm:block': index >= 10 && index < 12,
                'lg:block': index >= 10,
              })}
            >
              <Image
                src={photoUrl}
                width={300}
                height={200}
                loader={({ src, width, quality }) => {
                  return cloudinary.url(src, { width })
                }}
                placeholder="blur"
                blurDataURL={cloudinary.url(photoUrl, { width: 100, blur: 200 })}
              />
            </div>
          ))}
        </div>
      </Section>

      <Section>
        <div className="grid lg:grid-cols-2 gap-8 max-w-screen-lg	mx-auto mb-6">
          <div className="prose-lg text-center lg:prose lg:text-left mx-auto">
            <p>
              На конференциях Онтико мы собираем большое число экспертов из разных областей, которые
              делятся с участниками своим опытом и лайфхаками. Сейчас вам не обязательно ждать
              очередной конференции - вы можете записаться на консультацию у нужного эксперта прямо
              сейчас.
            </p>
          </div>

          <div className="hidden lg:block">
            <Image
              src="ontico/21-05-17_17-03_0534_L_sj335b.jpg"
              width={550}
              height={(1333 / 2000) * 550}
              loader={({ src, width, quality }) => {
                return cloudinary.url(src, { width })
              }}
              placeholder="blur"
              blurDataURL={cloudinary.url('ontico/21-05-17_17-03_0534_L_sj335b.jpg', {
                width: 100,
                blur: 400,
              })}
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
          <MentorsFilters allowSponsors={false} appliedFilters={appliedFilters} />
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
            href={ontico_landing_url}
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
