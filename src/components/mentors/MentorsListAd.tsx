interface MentorsListAdProps {
  id?: string
}

export default function MentorsListAd({
  id = 'mentors-list-ad-slot',
}: MentorsListAdProps): JSX.Element {
  return (
    <div
      data-testid="mentors-list-ad"
      aria-label="Реклама"
      className="w-full h-[480px] sm:h-[420px] overflow-hidden bg-gray-100"
    >
      <div id={id} className="w-full h-full overflow-hidden" />
    </div>
  )
}
