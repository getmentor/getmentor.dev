import { Card } from './Card'

export default function MentorsList(props) {
  const {
    mentors,
    hasMore,
    onClickMore,
  } = props

  return (
    <>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-4">
        {mentors.map(mentor => (
          <Card
            key={mentor.id}
            linkUrl={'/' + mentor.slug}
            imageUrl={mentor.photo.thumbnails?.large.url}
            extras={(
              <>
                <div className="top-0 left-0">{mentor.experience}</div>
                <div className="top-0 right-0">{'✅ ' + mentor.menteeCount}</div>
                <div className="bottom-0 left-0">{mentor.price}</div>
                <div className="bottom-0 right-0">➡️</div>
              </>
            )}
          >
            <div className="text-xl">{mentor.name}</div>
            <p>{mentor.job}</p>
          </Card>
        ))}
      </div>

      {hasMore && (
        <div className="text-center">
          <button
            className="button"
            onClick={() => onClickMore()}
          >Посмотреть ещё</button>
        </div>
      )}
    </>
  )
}
