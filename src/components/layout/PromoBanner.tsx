import analytics from '@/lib/analytics'

/**
 * Promo band for openmentor.io, sitting above the nav.
 *
 * Two goals (in this order):
 *   1. SEO — a real, server-rendered, followed <a> from getmentor.dev to
 *      openmentor.io. No rel="nofollow", no JS-only navigation: the link must
 *      be in the HTML source for crawlers to see and pass equity.
 *   2. Organic referral — send the slice of the audience that wants a mentor
 *      abroad to the international sibling project.
 *
 * Copy is English on purpose: openmentor.io is an English-first service, so the
 * banner doubles as a self-qualifying filter — someone who can't read it isn't
 * the target anyway.
 *
 * The whole band is one link (bigger click target, and the full sentence
 * becomes natural anchor text). Navy is openmentor's brand colour, which
 * signals "different destination" before a word is read, and keeps the band
 * from competing with getmentor's own orange CTA further down the page.
 */

/** Destination with attribution so the referral shows up in analytics. */
const TARGET_URL =
  'https://openmentor.io/?utm_source=getmentor.dev&utm_medium=referral&utm_campaign=top-banner'

export default function PromoBanner(): JSX.Element {
  return (
    <a
      href={TARGET_URL}
      onClick={() => analytics.event(analytics.events.OPENMENTOR_BANNER_CLICKED)}
      className="group block border-b border-white/10 bg-[#132A52] no-underline transition-colors hover:bg-[#1A3767]"
    >
      <div className="container flex flex-wrap items-center justify-center gap-x-3 gap-y-1 py-3 text-center">
        <span className="text-[15px] font-medium leading-snug text-white">
          {/* Shorter question on phones so the band stays a single line. */}
          <span className="sm:hidden">🌍 Need a mentor abroad?</span>
          <span className="hidden sm:inline">🌍 Looking for an international mentor?</span>
        </span>

        <span className="inline-flex items-center gap-1 whitespace-nowrap rounded-full bg-[#17C3B2] px-3 py-1 text-[13px] font-bold text-[#132A52] transition-colors group-hover:bg-white">
          openmentor.io
          <span aria-hidden="true" className="transition-transform group-hover:translate-x-0.5">
            →
          </span>
        </span>
      </div>
    </a>
  )
}
