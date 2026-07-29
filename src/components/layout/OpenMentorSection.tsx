import analytics from '@/lib/analytics'
import Section from '@/components/ui/Section'

/**
 * Homepage section promoting openmentor.io, the international sibling project.
 *
 * Sits between "Нас поддерживают" and "Донат". Deliberately styled in
 * openmentor's palette (navy / mint) rather than getmentor's cream+orange, so
 * it reads as a distinct destination and stands out from the sections above
 * and below it.
 *
 * SEO notes:
 *   - Real <h2>/<h3> hierarchy with descriptive, keyword-bearing copy (the
 *     page's <h1> is "Найди своего ментора", so <h2> is the correct level).
 *   - Two server-rendered, followed links to openmentor.io — the root and
 *     /bementor — spreading equity across more than one target page.
 *   - Copy is English on purpose: openmentor.io is an English-first service,
 *     so the section doubles as a self-qualifying filter.
 */

const UTM = 'utm_source=getmentor.dev&utm_medium=referral&utm_campaign=homepage-section'
const HOME_URL = `https://openmentor.io/?${UTM}`
const BEMENTOR_URL = `https://openmentor.io/bementor?${UTM}`

interface PrincipleProps {
  title: string
  children: React.ReactNode
}

function Principle({ title, children }: PrincipleProps): JSX.Element {
  return (
    <div className="rounded-xl bg-white/[0.06] p-5 text-left">
      <h3 className="mb-2 mt-0 text-[17px] font-bold leading-snug text-[#17C3B2]">{title}</h3>
      <p className="my-0 text-[14px] leading-relaxed text-white/75">{children}</p>
    </div>
  )
}

export default function OpenMentorSection(): JSX.Element {
  return (
    <Section id="openmentor" className="bg-gradient-to-br from-[#132A52] to-[#0E1F3D] text-white">
      <div className="mx-auto max-w-3xl text-center">
        <div className="mb-3 text-[12px] font-bold uppercase tracking-[0.14em] text-[#17C3B2]">
          🌍 English-first · Mentors worldwide
        </div>

        <Section.Title className="!mb-5 text-white">
          Find an international mentor at OpenMentor
        </Section.Title>

        <p className="my-0 text-[16px] leading-relaxed text-white/80">
          <a
            href={HOME_URL}
            onClick={() =>
              analytics.event(analytics.events.OPENMENTOR_SECTION_CLICKED, { placement: 'intro' })
            }
            className="font-semibold text-white underline decoration-[#17C3B2] decoration-2 underline-offset-2 hover:text-[#17C3B2]"
          >
            openmentor.io
          </a>{' '}
          is GetMentor&rsquo;s international sister project. Same idea — people who need advice, and
          experienced people happy to share it — but in English, with mentors from companies around
          the world.
        </p>
      </div>

      <div className="mx-auto mt-10 grid max-w-4xl gap-4 sm:grid-cols-3">
        <Principle title="Free or paid — the mentor decides">
          Plenty of mentors there help for free; others set their own price. You agree on it
          directly, one on one.
        </Principle>

        <Principle title="No commission, ever">
          No fees, no paywall, no premium tier. The project is funded by donations, not by taking a
          cut of your session.
        </Principle>

        <Principle title="Practitioners, not coaches">
          Engineers, designers and managers who do the work day to day, sharing what they actually
          know.
        </Principle>
      </div>

      <div className="mt-10 text-center">
        <a
          href={HOME_URL}
          onClick={() =>
            analytics.event(analytics.events.OPENMENTOR_SECTION_CLICKED, { placement: 'cta' })
          }
          className="button bg-[#17C3B2] text-[#132A52] font-bold"
        >
          Browse mentors at openmentor.io →
        </a>

        <p className="mb-0 mt-4 text-[14px] text-white/70">
          Want to mentor internationally?{' '}
          <a
            href={BEMENTOR_URL}
            onClick={() =>
              analytics.event(analytics.events.OPENMENTOR_SECTION_CLICKED, {
                placement: 'bementor',
              })
            }
            className="font-semibold text-[#17C3B2] underline underline-offset-2 hover:text-white"
          >
            Join as a mentor there
          </a>
          .
        </p>
      </div>
    </Section>
  )
}
