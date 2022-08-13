import Multiselect from 'multiselect-react-dropdown'
import { useForm, Controller } from 'react-hook-form'
import Wysiwyg from './Wysiwyg'
import filters from '../config/filters'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleNotch } from '@fortawesome/free-solid-svg-icons'
import { faQuestionCircle } from '@fortawesome/free-solid-svg-icons'
import ReactTooltip from 'react-tooltip'

const Url = require('url')

export default function ProfileForm({ mentor, isLoading, isError, onSubmit }) {
  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm()

  return (
    <form className="space-y-8" onSubmit={handleSubmit(onSubmit)}>
      <div>
        <label htmlFor="name" className="block mb-2 font-medium text-gray-700">
          Ваше имя и фамилия
        </label>

        {errors.name && (
          <div className="text-sm text-red-700 mt-3 mb-2">Это поле обязательно для заполнения.</div>
        )}

        <input
          type="text"
          {...register('name', { required: true })}
          defaultValue={mentor.name}
          id="name"
          autoComplete="name"
          className="focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
        />
      </div>

      <div>
        <label htmlFor="job" className="block mb-2 font-medium text-gray-700">
          Должность
        </label>

        {errors.job && (
          <div className="text-sm text-red-700 mt-3 mb-2">Это поле обязательно для заполнения.</div>
        )}

        <input
          type="text"
          {...register('job', { required: true })}
          defaultValue={mentor.job}
          id="job"
          autoComplete="organization-title"
          className="focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
        />
      </div>

      <div>
        <label className="block mb-2 font-medium text-gray-700">
          <em>
            Для редактирования фото напишите в телеграм{' '}
            <a href="https://t.me/glamcoder" rel="nofollow">
              @glamcoder
            </a>
          </em>
        </label>
      </div>

      <div>
        <label htmlFor="workplace" className="block mb-2 font-medium text-gray-700">
          Компания{' '}
          <a data-tip data-for="workplace-tip">
            <FontAwesomeIcon icon={faQuestionCircle} />
          </a>
          <ReactTooltip id="workplace-tip" place="right" type="dark" effect="solid">
            <span>
              Если вы заняты в нескольких местах, укажите основную компанию. А остальное перечислите
              в описании “О себе”
            </span>
          </ReactTooltip>
        </label>

        {errors.workplace && (
          <div className="text-sm text-red-700 mt-3 mb-2">Это поле обязательно для заполнения.</div>
        )}

        <input
          type="text"
          {...register('workplace', { required: true })}
          defaultValue={mentor.workplace}
          id="workplace"
          autoComplete="organization"
          className="focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
        />
      </div>

      <div className="flex space-x-8">
        <div>
          <label htmlFor="experience" className="block mb-2 font-medium text-gray-700">
            Опыт
          </label>

          <select
            {...register('experience')}
            defaultValue={mentor.experience}
            id="experience"
            className="block w-full py-2 pl-3 pr-8 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          >
            {Object.keys(filters.experience).map((item) => (
              <option key={filters.experience[item]} value={filters.experience[item]}>
                {item}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="price" className="block mb-2 font-medium text-gray-700">
            Цена за часовую встречу
          </label>

          <select
            {...register('price')}
            defaultValue={mentor.price}
            id="price"
            className="block w-full py-2 pl-3 pr-8 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          >
            {filters.price.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="tags" className="block mb-2 font-medium text-gray-700">
          Специализация{' '}
          <a data-tip data-for="tags-tip">
            <FontAwesomeIcon icon={faQuestionCircle} />
          </a>
          <ReactTooltip id="tags-tip" place="right" type="dark" effect="solid">
            <span>
              Здесь вам нужно указать основную вашу текущую специализацию и ту, в которой вы хорошо
              разбираетесь и готовы оказать помощь. По ним вас будут находить при использовании
              тегов в поисковом блоке. Они также будут видны в вашем профиле.
              <br />
              До 5 тегов.
            </span>
          </ReactTooltip>
        </label>

        <Controller
          name="tags"
          control={control}
          defaultValue={mentor.tags}
          render={({ field }) => (
            <Multiselect
              selectedValues={field.value}
              onSelect={(selectedList, selectedItem) => field.onChange(selectedList)}
              onRemove={(selectedList, removedItem) => field.onChange(selectedList)}
              options={filters.tags}
              isObject={false}
              placeholder=""
              closeIcon="cancel"
              avoidHighlightFirstOption={true}
              closeOnSelect={false}
              style={{
                multiselectContainer: {},
                searchBox: {
                  padding: '0.5rem 0.75rem',
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '0.375rem',
                },
                inputField: {
                  fontSize: '0.875rem',
                  lineHeight: '1.25rem',
                  padding: 'unset',
                  margin: 'unset',
                },
                chips: {
                  fontSize: '0.875rem',
                  lineHeight: '1.25rem',
                  borderRadius: '1rem',
                  margin: 'unset',
                },
                optionContainer: {
                  border: '1px solid rgb(209, 213, 219)',
                },
                option: {
                  fontSize: '0.875rem',
                  lineHeight: '1.25rem',
                  padding: '0.5rem 0.75rem',
                },
                groupHeading: {},
              }}
            />
          )}
        />
      </div>

      <div>
        <label htmlFor="about" className="block mb-2 font-medium text-gray-700">
          Расскажите о себе{' '}
          <a data-tip data-for="about-tip">
            <FontAwesomeIcon icon={faQuestionCircle} />
          </a>
          <ReactTooltip id="about-tip" place="right" type="dark" effect="solid">
            <span>
              Желательно два-три абзаца: где работали, что интересует в профессиональном поле, каких
              методик в менторстве придерживаетесь
            </span>
          </ReactTooltip>
        </label>

        {errors.about && (
          <div className="text-sm text-red-700 mt-3 mb-2">Это поле обязательно для заполнения.</div>
        )}

        <div className="mt-1">
          <Controller
            name="about"
            control={control}
            defaultValue={mentor.about}
            rules={{ required: true }}
            render={({ field }) => (
              <Wysiwyg
                content={field.value}
                onUpdate={(editor) => field.onChange(editor.getHTML())}
              />
            )}
          />
        </div>
      </div>

      <div>
        <label htmlFor="description" className="block mb-2 font-medium text-gray-700">
          С чем вы можете помочь?{' '}
          <a data-tip data-for="description-tip">
            <FontAwesomeIcon icon={faQuestionCircle} />
          </a>
          <ReactTooltip id="description-tip" place="right" type="dark" effect="solid">
            <span>
              Лучше, если вы разделите текст на пункты. Например,
              <br />
            </span>
            <em>
              <span>Могу помочь:</span>
              <ul>
                <li>— разобраться в Kubernetes;</li>
                <li>— наладить процессы в команде;</li>
                <li>— выбрать оптимальную стратегию для развития стартапа;</li>
              </ul>
            </em>
            <br />
            <span>
              Будет классно, если вы укажете, какого уровня менти могут обращаться к вам за помощью:
              Junior-Middle-Senior, руководители команд, руководители C-level и так далее. Хватит
              одной строки, например: <em>Помогу Senior-разработчикам и лидерам команд.</em>
            </span>
          </ReactTooltip>
        </label>

        {errors.description && (
          <div className="text-sm text-red-700 mt-3 mb-2">Это поле обязательно для заполнения.</div>
        )}

        <div className="mt-1">
          <Controller
            name="description"
            control={control}
            defaultValue={mentor.description}
            rules={{ required: true }}
            render={({ field }) => (
              <Wysiwyg
                content={field.value}
                onUpdate={(editor) => field.onChange(editor.getHTML())}
              />
            )}
          />
        </div>
      </div>

      <div>
        <label htmlFor="competencies" className="block mb-2 font-medium text-gray-700">
          Навыки и технологии (через запятую){' '}
          <a data-tip data-for="competencies-tip">
            <FontAwesomeIcon icon={faQuestionCircle} />
          </a>
          <ReactTooltip id="competencies-tip" place="right" type="dark" effect="solid">
            <span>
              Перечислите через запятую навыки, по которым хотите консультировать. Например:
              JavaScript, React, Leadership, Code Review. По ним менти смогут вас найти.
            </span>
          </ReactTooltip>
        </label>

        {errors.competencies && (
          <div className="text-sm text-red-700 mt-3 mb-2">Это поле обязательно для заполнения.</div>
        )}

        <input
          type="text"
          {...register('competencies', { required: true })}
          defaultValue={mentor.competencies}
          id="competencies"
          className="focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
        />
      </div>

      <div>
        <label htmlFor="calendarUrl" className="block mb-2 font-medium text-gray-700">
          Ссылка на запись в ваш календарь (
          <a href="https://calendly.com" target="_blank" className="link" rel="noreferrer">
            Calendly
          </a>
          ,{' '}
          <a href="https://koalendar.com" target="_blank" className="link" rel="noreferrer">
            Koalendar
          </a>{' '}
          или что-то ещё){' '}
          <a data-tip data-for="calendar-tip">
            <FontAwesomeIcon icon={faQuestionCircle} />
          </a>
          <ReactTooltip id="calendar-tip" place="right" type="dark" effect="solid">
            <span>
              Если вы пользуетесь системами управления календарём (например, Calendly.com), то
              укажите ссылку на ваш календарь. Тогда менти смогут сами записываться к вам на
              встречу.
            </span>
          </ReactTooltip>
        </label>

        {errors.calendarUrl && (
          <div className="text-sm text-red-700 mt-3 mb-2">Здесь должна быть валидная ссылка</div>
        )}

        <input
          type="text"
          {...register('calendarUrl', {
            validate: {
              checkUrl: (v) => {
                if (!v) return true
                try {
                  var url = Url.parse(v)
                  return url.protocol === 'http:' || url.protocol === 'https:'
                } catch (e) {
                  return false
                }
              },
            },
          })}
          defaultValue={mentor.calendarUrl}
          id="calendarUrl"
          className="focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
        />
      </div>

      {isError && (
        <div className="text-red-700">
          Ошибка. Скорее всего мы уже чиним, попробуйте сохранить форму позже.
        </div>
      )}

      <button type="submit" className="button" disabled={isLoading}>
        {isLoading ? (
          <>
            <FontAwesomeIcon className="animate-spin" icon={faCircleNotch} />
            <span className="ml-2">Сохраняю</span>
          </>
        ) : (
          <span>Сохранить</span>
        )}
      </button>
    </form>
  )
}
