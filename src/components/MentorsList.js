import Link from 'next/link'
import pluralize from '../lib/pluralize'

export default function MentorsList(props) {
  const { mentors, hasMore, onClickMore } = props

  return (
    <>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-4">
        {mentors.map((mentor) => (
          <Link key={mentor.id} href={'/' + mentor.slug}>
            <a target="_blank">
              <div
                className="aspect-w-5 aspect-h-4 bg-center bg-cover bg-no-repeat"
                style={{
                  backgroundImage: `url(${mentor.photo.thumbnails?.large.url || mentor.photo_url})`,
                }}
              />

              <div className="mt-3 mb-5">
                <div className="text-2xl mb-1">{mentor.name}</div>
                <div className="mb-2">{mentor.job}</div>

                <div>😎 {mentor.experience} лет опыта</div>
                <div>💰 {mentor.price}</div>
                {mentor.menteeCount > 0 && (
                  <div>
                    🤝 {mentor.menteeCount}{' '}
                    {pluralize(mentor.menteeCount, [
                      'встреча проведена',
                      'встречи проведено',
                      'встреч проведено',
                    ])}
                  </div>
                )}
              </div>
            </a>
          </Link>
        ))}
      </div>

      {hasMore && (
        <div className="text-center">
          <button className="button" onClick={() => onClickMore()}>
            Посмотреть ещё
          </button>
        </div>
      )}
    </>
  )
}
