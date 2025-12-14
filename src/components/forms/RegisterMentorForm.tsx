import Select, { type MultiValue, type StylesConfig } from 'react-select'
import Image from 'next/image'
import { useForm, Controller } from 'react-hook-form'
import ReCAPTCHA from 'react-google-recaptcha'
import Wysiwyg from './Wysiwyg'
import filters from '@/config/filters'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleNotch, faQuestionCircle } from '@fortawesome/free-solid-svg-icons'
import { Tooltip } from 'react-tooltip'
import Link from 'next/link'
import { useState, useRef, type ChangeEvent } from 'react'
import type { RegisterMentorRequest, ProfilePictureData } from '@/types/api'

interface TagOption {
  value: string
  label: string
}

interface RegisterFormData {
  name: string
  email: string
  telegram: string
  job: string
  workplace: string
  experience: string
  price: string
  tags: string[]
  about: string
  description: string
  competencies: string
  calendarUrl?: string
}

interface RegisterMentorFormProps {
  isLoading: boolean
  isError: boolean
  onSubmit: (data: RegisterMentorRequest) => void
}

// Custom styles for react-select to match the previous Multiselect styling
const selectStyles: StylesConfig<TagOption, true> = {
  control: (base) => ({
    ...base,
    padding: '0.25rem 0.5rem',
    borderColor: 'rgb(209, 213, 219)',
    borderRadius: '0.375rem',
    boxShadow: 'none',
    '&:hover': {
      borderColor: 'rgb(209, 213, 219)',
    },
  }),
  multiValue: (base) => ({
    ...base,
    borderRadius: '1rem',
    backgroundColor: '#1e40af',
  }),
  multiValueLabel: (base) => ({
    ...base,
    color: 'white',
    fontSize: '0.875rem',
    lineHeight: '1.25rem',
    padding: '0.125rem 0.5rem',
  }),
  multiValueRemove: (base) => ({
    ...base,
    color: 'white',
    '&:hover': {
      backgroundColor: '#1e3a8a',
      color: 'white',
    },
  }),
  option: (base) => ({
    ...base,
    fontSize: '0.875rem',
    lineHeight: '1.25rem',
    padding: '0.5rem 0.75rem',
  }),
  menu: (base) => ({
    ...base,
    border: '1px solid rgb(209, 213, 219)',
  }),
  input: (base) => ({
    ...base,
    fontSize: '0.875rem',
    lineHeight: '1.25rem',
  }),
}

// Convert string array to option array for react-select
const tagsToOptions = (tags: string[]): TagOption[] =>
  tags.map((tag) => ({ value: tag, label: tag }))

// All available tags as options
const tagOptions = tagsToOptions(filters.tags)

function isValidUrl(value?: string): boolean {
  if (!value) return true
  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

export default function RegisterMentorForm({
  isLoading,
  isError,
  onSubmit,
}: RegisterMentorFormProps): JSX.Element {
  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>()

  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [imageError, setImageError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [recaptchaToken, setRecaptchaToken] = useState<string>('')

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0]
    setImageError('') // Clear any previous errors

    if (!file) return

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      setImageError('Пожалуйста, выберите изображение в формате JPEG, PNG или WebP.')
      return
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      setImageError('Размер файла не должен превышать 10 МБ.')
      return
    }

    setSelectedImage(file)

    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setImagePreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleCancelImage = (): void => {
    setSelectedImage(null)
    setImagePreview(null)
    setImageError('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleCaptchaOnChange = (token: string | null): void => {
    setRecaptchaToken(token || '')
  }

  const handleFormSubmit = (data: RegisterFormData): void => {
    if (!selectedImage) {
      setImageError('Пожалуйста, выберите фотографию профиля.')
      return
    }

    if (!recaptchaToken) {
      return
    }

    // Read the image file as base64
    const reader = new FileReader()
    reader.onloadend = () => {
      const base64Image = reader.result as string

      const profilePicture: ProfilePictureData = {
        image: base64Image,
        fileName: selectedImage.name,
        contentType: selectedImage.type,
      }

      const requestData: RegisterMentorRequest = {
        ...data,
        profilePicture,
        recaptchaToken,
      }

      onSubmit(requestData)
    }
    reader.readAsDataURL(selectedImage)
  }

  const requiredText = 'Это поле обязательно для заполнения.'

  return (
    <form className="space-y-8" onSubmit={handleSubmit(handleFormSubmit)}>
      <div>
        <label htmlFor="name" className="block mb-2 font-medium text-gray-700">
          Ваше имя и фамилия
          <span className="text-sm text-red-700 mt-3 mb-2"> *</span>
        </label>

        {errors.name && <div className="text-sm text-red-700 mt-3 mb-2">{requiredText}</div>}

        <input
          type="text"
          {...register('name', { required: true, maxLength: 100 })}
          id="name"
          autoComplete="name"
          className="focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
        />
      </div>

      <div>
        <label htmlFor="email" className="block mb-2 font-medium text-gray-700">
          Ваша почта
          <span className="text-sm text-red-700 mt-3 mb-2"> *</span>
        </label>

        {errors.email && errors.email.type === 'required' && (
          <div className="text-sm text-red-700 mt-3 mb-2">{requiredText}</div>
        )}

        {errors.email && errors.email.type === 'pattern' && (
          <div className="text-sm text-red-700 mt-3 mb-2">
            Пожалуйста, введите корректный адрес электронной почты.
          </div>
        )}

        <input
          type="email"
          {...register('email', { required: true, pattern: /^\S+@\S+$/i, maxLength: 255 })}
          id="email"
          autoComplete="email"
          className="focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
        />
      </div>

      <div>
        <label htmlFor="telegram" className="block mb-2 font-medium text-gray-700">
          Telegram @username
          <span className="text-sm text-red-700 mt-3 mb-2"> *</span>
        </label>

        {errors.telegram && <div className="text-sm text-red-700 mt-3 mb-2">{requiredText}</div>}

        <input
          type="text"
          {...register('telegram', { required: true, maxLength: 50 })}
          id="telegram"
          autoComplete="username"
          className="focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
        />

        <p className="mt-2 text-sm text-gray-500">
          Для того, чтобы мы могли с вами связаться. Вводите только username, без @ и ссылок.
        </p>
      </div>

      <div>
        <label htmlFor="profilePicture" className="block mb-2 font-medium text-gray-700">
          Фотография профиля
          <span className="text-sm text-red-700 mt-3 mb-2"> *</span>{' '}
          <a data-tooltip-id="photo-tip">
            <FontAwesomeIcon icon={faQuestionCircle} />
          </a>
          <Tooltip id="photo-tip" place="right">
            <span>
              Загрузите своё фото для профиля. Поддерживаются форматы JPEG, PNG и WebP. Максимальный
              размер файла - 10 МБ.
            </span>
          </Tooltip>
        </label>

        <div className="mt-2 space-y-4">
          {imagePreview && (
            <div className="flex items-center space-x-4">
              <Image
                src={imagePreview}
                alt="Preview"
                className="w-24 h-24 rounded-full object-cover"
                unoptimized
                width={96}
                height={96}
              />
              <span className="text-sm text-gray-600">Предварительный просмотр</span>
            </div>
          )}

          <div className="flex items-center space-x-4">
            <input
              ref={fileInputRef}
              type="file"
              id="profilePicture"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              onChange={handleImageChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
            />
          </div>

          {selectedImage && (
            <div className="flex items-center space-x-4">
              <span className="text-sm text-green-700">Фото выбрано: {selectedImage.name}</span>
              <button
                type="button"
                onClick={handleCancelImage}
                className="text-sm text-gray-600 hover:text-gray-800"
              >
                Отменить
              </button>
            </div>
          )}

          {imageError && (
            <div className="text-sm text-red-700" role="alert">
              {imageError}
            </div>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="job" className="block mb-2 font-medium text-gray-700">
          Должность
          <span className="text-sm text-red-700 mt-3 mb-2"> *</span>
        </label>

        {errors.job && <div className="text-sm text-red-700 mt-3 mb-2">{requiredText}</div>}

        <input
          type="text"
          {...register('job', { required: true, maxLength: 200 })}
          id="job"
          autoComplete="organization-title"
          className="focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
        />
      </div>

      <div>
        <label htmlFor="workplace" className="block mb-2 font-medium text-gray-700">
          Компания
          <span className="text-sm text-red-700 mt-3 mb-2"> *</span>{' '}
          <a data-tooltip-id="workplace-tip">
            <FontAwesomeIcon icon={faQuestionCircle} />
          </a>
          <Tooltip id="workplace-tip" place="right">
            <span>
              Если вы заняты в нескольких местах, укажите основную компанию. А остальное перечислите
              в описании &quot;О себе&quot;
            </span>
          </Tooltip>
        </label>

        {errors.workplace && <div className="text-sm text-red-700 mt-3 mb-2">{requiredText}</div>}

        <input
          type="text"
          {...register('workplace', { required: true, maxLength: 200 })}
          id="workplace"
          autoComplete="organization"
          className="focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
        />
      </div>

      <div className="flex space-x-8">
        <div>
          <label htmlFor="experience" className="block mb-2 font-medium text-gray-700">
            Опыт
            <span className="text-sm text-red-700 mt-3 mb-2"> *</span>
          </label>

          <select
            {...register('experience', { required: true })}
            id="experience"
            className="block w-full py-2 pl-3 pr-8 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          >
            <option value="">Выберите опыт</option>
            {Object.keys(filters.experience).map((item) => (
              <option
                key={filters.experience[item as keyof typeof filters.experience]}
                value={filters.experience[item as keyof typeof filters.experience]}
              >
                {item}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="price" className="block mb-2 font-medium text-gray-700">
            Цена за часовую встречу
            <span className="text-sm text-red-700 mt-3 mb-2"> *</span>
          </label>

          <select
            {...register('price', { required: true })}
            id="price"
            className="block w-full py-2 pl-3 pr-8 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          >
            <option value="">Выберите цену</option>
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
          Специализация
          <span className="text-sm text-red-700 mt-3 mb-2"> *</span>{' '}
          <a data-tooltip-id="tags-tip">
            <FontAwesomeIcon icon={faQuestionCircle} />
          </a>
          <Tooltip id="tags-tip" place="right">
            <span>
              Здесь вам нужно указать основную вашу текущую специализацию и ту, в которой вы хорошо
              разбираетесь и готовы оказать помощь. По ним вас будут находить при использовании
              тегов в поисковом блоке. Они также будут видны в вашем профиле.
              <br />
              Минимум 1, максимум 5 тегов.
            </span>
          </Tooltip>
        </label>

        {errors.tags && <div className="text-sm text-red-700 mt-3 mb-2">{requiredText}</div>}

        <Controller
          name="tags"
          control={control}
          defaultValue={[]}
          rules={{
            required: true,
            validate: (value) =>
              (value.length >= 1 && value.length <= 5) || 'Выберите от 1 до 5 тегов',
          }}
          render={({ field }) => (
            <Select<TagOption, true>
              isMulti
              value={tagsToOptions(field.value || [])}
              onChange={(newValue: MultiValue<TagOption>) => {
                if (newValue.length <= 5) {
                  field.onChange(newValue.map((opt) => opt.value))
                }
              }}
              options={tagOptions}
              closeMenuOnSelect={false}
              placeholder="Выберите теги..."
              noOptionsMessage={() => 'Нет доступных опций'}
              styles={selectStyles}
              classNamePrefix="react-select"
            />
          )}
        />

        {errors.tags && errors.tags.type === 'validate' && (
          <div className="text-sm text-red-700 mt-2">Выберите от 1 до 5 тегов.</div>
        )}
      </div>

      <div>
        <label htmlFor="about" className="block mb-2 font-medium text-gray-700">
          Расскажите о себе
          <span className="text-sm text-red-700 mt-3 mb-2"> *</span>{' '}
          <a data-tooltip-id="about-tip">
            <FontAwesomeIcon icon={faQuestionCircle} />
          </a>
          <Tooltip id="about-tip" place="right">
            <span>
              Желательно два-три абзаца: где работали, что интересует в профессиональном поле, каких
              методик в менторстве придерживаетесь
            </span>
          </Tooltip>
        </label>

        {errors.about && <div className="text-sm text-red-700 mt-3 mb-2">{requiredText}</div>}

        <div className="mt-1">
          <Controller
            name="about"
            control={control}
            defaultValue=""
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
          С чем вы можете помочь?
          <span className="text-sm text-red-700 mt-3 mb-2"> *</span>{' '}
          <a data-tooltip-id="description-tip">
            <FontAwesomeIcon icon={faQuestionCircle} />
          </a>
          <Tooltip id="description-tip" place="right">
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
          </Tooltip>
        </label>

        {errors.description && <div className="text-sm text-red-700 mt-3 mb-2">{requiredText}</div>}

        <div className="mt-1">
          <Controller
            name="description"
            control={control}
            defaultValue=""
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
          Навыки и технологии (через запятую)
          <span className="text-sm text-red-700 mt-3 mb-2"> *</span>{' '}
          <a data-tooltip-id="competencies-tip">
            <FontAwesomeIcon icon={faQuestionCircle} />
          </a>
          <Tooltip id="competencies-tip" place="right">
            <span>
              Перечислите через запятую навыки, по которым хотите консультировать. Например:
              JavaScript, React, Leadership, Code Review. По ним менти смогут вас найти.
            </span>
          </Tooltip>
        </label>

        {errors.competencies && (
          <div className="text-sm text-red-700 mt-3 mb-2">{requiredText}</div>
        )}

        <input
          type="text"
          {...register('competencies', { required: true, maxLength: 5000 })}
          id="competencies"
          className="focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
        />
      </div>

      <div>
        <label htmlFor="calendarUrl" className="block mb-2 font-medium text-gray-700">
          Ссылка на запись в ваш календарь (
          <Link
            href="https://calendlab.ru/signup?referral_code=for-mentors-6-months"
            target="_blank"
            className="link"
            rel="noreferrer"
          >
            CalendLab
          </Link>
          ,{' '}
          <Link href="https://koalendar.com" target="_blank" className="link" rel="noreferrer">
            Koalendar
          </Link>
          ,{' '}
          <Link href="https://calendly.com" target="_blank" className="link" rel="noreferrer">
            Calendly
          </Link>{' '}
          или что-то ещё){' '}
          <a data-tooltip-id="calendar-tip">
            <FontAwesomeIcon icon={faQuestionCircle} />
          </a>
          <Tooltip id="calendar-tip" place="right">
            <span>
              Если вы пользуетесь системами управления календарём, то укажите ссылку на ваш
              календарь. Тогда менти смогут сами записываться к вам на встречу. Мы рекомендуем
              использовать Calendly, Koalendar или CalendLab, так как они интегрированы с нашей
              платформой и форма записи будет отображаться сразу после того, как менти создаст
              заявку.
            </span>
          </Tooltip>
        </label>

        {errors.calendarUrl && (
          <div className="text-sm text-red-700 mt-3 mb-2">Здесь должна быть валидная ссылка</div>
        )}

        <input
          type="text"
          {...register('calendarUrl', {
            validate: {
              checkUrl: isValidUrl,
            },
            maxLength: 500,
          })}
          id="calendarUrl"
          className="focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
        />

        <label htmlFor="calendarUrl" className="block mb-2 mt-1 font-small italic text-gray-700">
          🎉 Вы можете получить первые 6 месяцев CalendLab бесплатно по{' '}
          <Link
            href="https://calendlab.ru/signup?referral_code=for-mentors-6-months"
            target="_blank"
            className="link"
            rel="noreferrer"
          >
            этой ссылке
          </Link>
          .
        </label>
      </div>

      <div>
        <ReCAPTCHA
          sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_V2_SITE_KEY || ''}
          onChange={handleCaptchaOnChange}
          hl="ru"
        />

        {!recaptchaToken && errors.name && (
          <div className="text-sm text-red-700 mt-2">Пожалуйста, подтвердите, что вы не робот.</div>
        )}
      </div>

      {isError && (
        <div className="text-red-700">
          Ошибка. Скорее всего мы уже чиним, попробуйте отправить заявку позже.
        </div>
      )}

      <button type="submit" className="button" disabled={isLoading || !recaptchaToken}>
        {isLoading ? (
          <>
            <FontAwesomeIcon className="animate-spin" icon={faCircleNotch} />
            <span className="ml-2">Отправляю...</span>
          </>
        ) : (
          <span>Отправить заявку</span>
        )}
      </button>
    </form>
  )
}
