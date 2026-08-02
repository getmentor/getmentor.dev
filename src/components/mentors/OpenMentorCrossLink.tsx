import analytics from '@/lib/analytics'

/**
 * Cross-link card shown on a mentor's profile when the same person also has a
 * profile on openmentor.io, the international sibling project.
 *
 * Two goals (in this order), same as PromoBanner:
 *   1. SEO — a real, server-rendered, followed <a> connecting the two profiles
 *      of one person across the two sites. No rel="nofollow", no
 *      target="_blank", no JS-only navigation: the link must be in the HTML
 *      source for crawlers to see and pass equity. The profile page backs this
 *      up with `Person` / `sameAs` JSON-LD pointing at the same (canonical,
 *      UTM-free) URL — see `openmentorProfileUrl` below.
 *   2. Organic referral — a reader who wants the English-speaking service gets
 *      a one-click path straight to that mentor there, not to a generic home
 *      page.
 *
 * Copy is English on purpose, like the top banner: openmentor.io is an
 * English-first service, so the card doubles as a self-qualifying filter.
 *
 * Navy/mint is openmentor's palette (hard-coded here, as in PromoBanner and
 * OpenMentorSection — this repo carries no tokens for it). It marks the card as
 * "different destination" and keeps it visually subordinate to the page's
 * primary «Оставить заявку» CTA, which must stay the main action.
 */

const UTM = 'utm_source=getmentor.dev&utm_medium=referral&utm_campaign=mentor-crosslink'

/**
 * Canonical profile URL on openmentor.io — no UTM parameters.
 * Use this (not the href below) anywhere the URL identifies the page rather
 * than links to it: JSON-LD `sameAs`, canonicals, feeds.
 */
export function openmentorProfileUrl(openmentorSlug: string): string {
  return `https://openmentor.io/mentor/${openmentorSlug}`
}

/** Same URL, tagged so the referral is attributable in analytics. */
function openmentorProfileHref(openmentorSlug: string): string {
  return `${openmentorProfileUrl(openmentorSlug)}?${UTM}`
}

/** "Иван Петров" → "Иван". Falls back to the whole string if there's no space. */
function firstName(fullName: string): string {
  const trimmed = fullName.trim()
  return trimmed.split(/\s+/)[0] || trimmed
}

interface OpenMentorCrossLinkProps {
  mentorName: string
  openmentorSlug: string
}

export default function OpenMentorCrossLink({
  mentorName,
  openmentorSlug,
}: OpenMentorCrossLinkProps): JSX.Element {
  return (
    <a
      href={openmentorProfileHref(openmentorSlug)}
      onClick={() =>
        analytics.event(analytics.events.OPENMENTOR_PROFILE_CLICKED, {
          openmentor_slug: openmentorSlug,
        })
      }
      data-testid="openmentor-cross-link"
      className="group block rounded-xl border border-white/10 bg-gradient-to-br from-[#132A52] to-[#0E1F3D] p-5 no-underline transition-colors hover:from-[#1A3767] hover:to-[#132A52]"
    >
      {/*
        Plain <img>, not next/image: this is a local static file, so the
        optimizer buys nothing and next/image would only add config surface.
        The CSP allows img-src 'self'.
      */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/openmentor/logo-horizontal-dark.svg"
        alt="OpenMentor"
        width={147}
        height={40}
        className="mb-3 block h-10 w-auto"
      />

      <p className="my-0 text-[14px] leading-relaxed text-white/75">
        <span className="font-semibold text-white">{firstName(mentorName)}</span> also mentors on
        openmentor.io — the English-speaking sister project.
      </p>

      <span className="mt-4 inline-flex items-center gap-1 rounded-full bg-[#17C3B2] px-3 py-1 text-[13px] font-bold text-[#132A52] transition-colors group-hover:bg-white">
        View profile
        <span aria-hidden="true" className="transition-transform group-hover:translate-x-0.5">
          →
        </span>
      </span>
    </a>
  )
}
