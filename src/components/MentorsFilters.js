import classNames from 'classnames'
import allFilters from '../config/filters'

export default function MentorsFilters(props) {
  const defaultProps = {
    tags: [],
    allowSponsors: true,
  }

  const {
    tags: selectedTags,
    onChange: onChangeTags,
    allowSponsors,
  } = { ...defaultProps, ...props }

  const TAG_ALL = 'All'

  const onClickTag = (tag) => {
    if (tag === TAG_ALL) {
      onChangeTags([])
    } else if (selectedTags.includes(tag)) {
      onChangeTags(selectedTags.filter((item) => item !== tag))
    } else {
      onChangeTags([...selectedTags, tag])
    }
  }

  return (
    <div className="text-center">
      <ul className="flex flex-wrap justify-center -m-1 mb-3">
        {[TAG_ALL].map((tag) => {
          const isActive = tag !== TAG_ALL ? selectedTags.includes(tag) : selectedTags.length === 0

          return (
            <li
              className={classNames('text-sm rounded-full py-1 px-4 m-1 cursor-pointer', {
                'bg-gray-300 hover:bg-gray-200 text-gray-600': !isActive,
                'bg-gray-700 text-white': isActive,
              })}
              key={tag}
              onClick={() => onClickTag(tag)}
            >
              {tag}
            </li>
          )
        })}

        {allowSponsors && (
          <>
            {allFilters.sponsors.map((tag) => {
              const isActive =
                tag !== TAG_ALL ? selectedTags.includes(tag) : selectedTags.length === 0

              return (
                <li
                  className={classNames('text-sm rounded-full py-1 px-4 m-1 cursor-pointer', {
                    'bg-indigo-200 hover:bg-indigo-300 text-gray-600': !isActive,
                    'bg-indigo-700 text-white': isActive,
                  })}
                  key={tag}
                  onClick={() => onClickTag(tag)}
                >
                  {tag}
                </li>
              )
            })}
          </>
        )}

        {allFilters.tags.map((tag) => {
          const isActive = tag !== TAG_ALL ? selectedTags.includes(tag) : selectedTags.length === 0

          return (
            <li
              className={classNames('text-sm rounded-full py-1 px-4 m-1 cursor-pointer', {
                'bg-gray-300 hover:bg-gray-200 text-gray-600': !isActive,
                'bg-gray-700 text-white': isActive,
              })}
              key={tag}
              onClick={() => onClickTag(tag)}
            >
              {tag}
            </li>
          )
        })}
      </ul>
      <ul className="flex flex-wrap justify-center -m-1 mb-3">
        <li
          className="rounded-full py-1 m-1"
          style={{ 'font-size': '1rem', 'line-height': '1.25rem' }}
        >
          <strong>Опыт: </strong>
        </li>

        {allFilters.experience.map((tag) => {
          const isActive = tag !== TAG_ALL ? selectedTags.includes(tag) : selectedTags.length === 0

          return (
            <li
              className={classNames('text-sm rounded-full py-1 px-4 m-1 cursor-pointer', {
                'bg-gray-300 hover:bg-gray-200 text-gray-600': !isActive,
                'bg-gray-700 text-white': isActive,
              })}
              key={tag}
              onClick={() => onClickTag(tag)}
            >
              {tag}
            </li>
          )
        })}
      </ul>

      <ul className="flex flex-wrap justify-center -m-1 mb-3">
        <li
          className="rounded-full py-1 m-1"
          style={{ 'font-size': '1rem', 'line-height': '1.25rem' }}
        >
          <strong>Цена: </strong>
        </li>

        {allFilters.price.map((tag) => {
          const isActive = tag !== TAG_ALL ? selectedTags.includes(tag) : selectedTags.length === 0

          return (
            <li
              className={classNames('text-sm rounded-full py-1 px-4 m-1 cursor-pointer', {
                'bg-gray-300 hover:bg-gray-200 text-gray-600': !isActive,
                'bg-gray-700 text-white': isActive,
              })}
              key={tag}
              onClick={() => onClickTag(tag)}
            >
              {tag}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
