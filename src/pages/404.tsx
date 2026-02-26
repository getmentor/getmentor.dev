import Head from 'next/head'
import Link from 'next/link'
import { Footer, MetaHeader, NavHeader, Section } from '@/components'
import seo from '@/config/seo'

export default function NotFound(): JSX.Element {
  const title = '404 – Страница не найдена | ' + seo.title

  return (
    <>
      <Head>
        <title>{title}</title>
        <MetaHeader customTitle="404 – Страница не найдена" />
      </Head>

      <NavHeader className="bg-primary-100" />

      <Section className="bg-primary-100" id="header">
        <div className="text-center py-14 lg:w-1/2 mx-auto">
          <p className="text-8xl font-semibold text-primary mb-0">404</p>
          <h1 className="mt-4">Страница не найдена</h1>
          <p className="pt-2">
            Похоже, такой страницы не существует. Возможно, она была перемещена или удалена.
          </p>
          <div className="mt-8">
            <Link href="/" className="button bg-primary-900 inline-block">
              На главную
            </Link>
          </div>
        </div>
      </Section>

      <Footer />
    </>
  )
}
