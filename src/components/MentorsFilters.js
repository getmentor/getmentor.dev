import classNames from 'classnames'

const allFilters = {
  tags: [
    'All',
    'Backend',
    'Frontend',
    'Code Review',
    'System Design',
    'UX/UI/Design',
    'iOS',
    'Android',
    'QA',
    'Marketing',
    'Content/Copy',
    'Databases',
    'Data Science/ML',
    'Аналитика',
    'Network',
    'Cloud',
    'DevOps/SRE',
    'Agile',
    'Team Lead/Management',
    'Project Management',
    'Product Management',
    'Entrepreneurship',
    'DevRel',
    'HR',
    'Карьера',
    'Собеседования',
    'Другое',
  ],
  price: [
    '✅ Бесплатно',
    '1000 руб',
    '2000 руб',
    '3000 руб',
    '4000 руб',
    '5000 руб',
    '6000 руб',
    '7000 руб',
    '8000 руб',
    '9000 руб',
    '🤝 По договоренности',
  ],
  experience: [
    '<2 лет',
    '😎 2-5 лет',
    '😎 5-10 лет',
    '🌟 10+ лет',
  ],
  sponsors: [
    'Эксперт Авито',
  ],
}

export default function MentorsFilters(props) {
  const {
    tags: selectedTags,
    onChange: onChangeTags,
  } = props

  const TAG_ALL = 'All'

  const onClickTag = (tag) => {
    if (tag === TAG_ALL) {
      onChangeTags([])
    } else if (selectedTags.includes(tag)) {
      onChangeTags(selectedTags.filter(item => item !== tag))
    } else {
      onChangeTags([ ...selectedTags, tag ])
    }
  }

  return (
    <div className="text-center">
      <ul className="flex flex-wrap justify-center -m-1 mb-4">
        {allFilters.tags.map(tag => {
          const isActive = (tag !== TAG_ALL)
            ? selectedTags.includes(tag)
            : (selectedTags.length === 0)

          return (
            <li
              className={classNames('text-sm rounded-full py-1 px-4 m-1 cursor-pointer', {
                'bg-gray-300 hover:bg-gray-200 text-gray-600': !isActive,
                'bg-gray-700 text-white': isActive,
              })}
              key={tag}
              onClick={() => onClickTag(tag)}
            >{tag}</li>
          )
        })}
      </ul>

      <ul className="flex flex-wrap justify-center -m-1 mb-6">
        {allFilters.sponsors.map(tag => {
          const isActive = (tag !== TAG_ALL)
            ? selectedTags.includes(tag)
            : (selectedTags.length === 0)

          return (
            <li
              className={classNames('text-sm rounded-full py-1 px-4 m-1 cursor-pointer', {
                'bg-gray-300 hover:bg-gray-200 text-gray-600': !isActive,
                'bg-gray-700 text-white': isActive,
              })}
              key={tag}
              onClick={() => onClickTag(tag)}
            >{tag}</li>
          )
        })}
      </ul>
    </div>
  )
}
