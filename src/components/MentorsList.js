import Link from 'next/link'

export default function MentorsList(props) {
  const {
    mentors,
    hasMore,
    onClickMore,
  } = props

  return (
    <>
      <div className="cards__wrapper per-row--4">
        {mentors.map(mentor => (
          <div className="card card__image-only has_hover" key={mentor.id}>
            <div className="card__inner">
              <div
                className="card__header"
                style={{ backgroundImage: 'url(' + mentor.photo.thumbnails.large.url + ')' }}
              >
                <div className="card__extras">
                  <div>{mentor.experience}</div>
                  <div>{'✅ ' + mentor.menteeCount}</div>
                  <div>{mentor.price}</div>
                  <div>➡️</div>
                </div>
                <div className="card__content">
                  <h4 className="card__title">{mentor.name}</h4>
                  <p className="card__description">{mentor.job}</p>
                </div>
                <div className="card__header_overlay" style={{ background: 'rgba(0,0,0,0.3)' }}></div>
              </div>

              <Link href={'/mentors/' + mentor.slug}>
                <a className="card__link" target="_blank" rel="noreferrer"></a>
              </Link>

              <div id={'popup_' + mentor.id} className="lity-popup lity-hide">
                <h3>{mentor.name}</h3>
                <p><b><em>{mentor.job}</em></b></p>
                <p>{mentor.description}</p>
                <p>
                  <Link
                    href={'/mentors/' + mentor.slug}
                    target="_blank"
                    rel="noreferrer"
                  >{'/mentors/' + mentor.slug}</Link>
                </p>

                <p className="text-center">
                  <a
                    className="button"
                    href={'https://airtable.com/shr5aTzZF5zKSRUDG?prefill_Mentor=' + mentor.id}
                    target="_blank"
                    rel="noreferrer"
                  >Оставить заявку</a>
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {hasMore && (
        <div className="more text-center">
          <button
            className="button btn__load_more"
            onClick={() => onClickMore()}
          >Посмотреть ещё</button>
        </div>
      )}
    </>
  )
}
