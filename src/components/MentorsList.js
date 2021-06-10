import Link from 'next/link'
import {Card} from "./Card";

export default function MentorsList(props) {
  const {
    mentors,
    hasMore,
    onClickMore,
  } = props

  return (
    <>
      <div className="flex flex-wrap">
        {mentors.map(mentor => (
          <div className="md:w-1/2 lg:w-1/3 xl:w-1/4" key={mentor.id}>
            <Card
              linkUrl={'/mentors/' + mentor.slug}
              imageUrl={mentor.photo.thumbnails.large.url}
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
          </div>
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
