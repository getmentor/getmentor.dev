import { useForm } from 'react-hook-form'
import ReCAPTCHA from 'react-google-recaptcha'
import TextareaAutosize from 'react-textarea-autosize'

export default function ContactMentorForm({ isLoading, isError, onSubmit }) {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm()

  const requiredText = 'Это поле обязательно для заполнения.'

  const handleCaptchaOnChange = (token) => {
    setValue('recaptchaToken', token)
  }

  return (
    <form className="space-y-8" onSubmit={handleSubmit(onSubmit)}>
      <div>
        <label htmlFor="email" className="block mb-2 font-medium text-gray-700">
          Ваша почта
          <span className="text-sm text-red-700 mt-3 mb-2"> *</span>
        </label>

        {errors.email && errors.email.type === 'required' && (
          <div className="text-sm text-red-700 mt-3 mb-2">{requiredText}</div>
        )}

        <input
          type="email"
          {...register('email', { required: true })}
          id="email"
          autoComplete="email"
          className="focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
        />
      </div>

      <div>
        <label htmlFor="name" className="block mb-2 font-medium text-gray-700">
          Ваше имя и фамилия
          <span className="text-sm text-red-700 mt-3 mb-2"> *</span>
        </label>

        {errors.name && errors.name.type === 'required' && (
          <div className="text-sm text-red-700 mt-3 mb-2">{requiredText}</div>
        )}

        <input
          type="text"
          {...register('name', { required: true })}
          id="name"
          autoComplete="name"
          className="focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
        />
      </div>

      <div>
        <label htmlFor="intro" className="block mb-2 font-medium text-gray-700">
          О чём хотите поговорить?
          <span className="text-sm text-red-700 mt-3 mb-2"> *</span>
        </label>

        {errors.intro && errors.intro.type === 'maxLength' && (
          <div className="text-sm text-red-700 mt-3 mb-2">
            Превышен лимит символов (не более 4000).
          </div>
        )}

        {errors.intro && errors.intro.type === 'required' && (
          <div className="text-sm text-red-700 mt-3 mb-2">{requiredText}</div>
        )}

        <div className="mt-1">
          <TextareaAutosize
            {...register('intro', { required: true, maxLength: 4000 })}
            id="intro"
            className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border border-gray-300 rounded-md"
            minRows={3}
          />
        </div>

        <p className="mt-2 text-sm text-gray-500">
          Расскажите в нескольких словах, в чём именно ментор может вам помочь.
        </p>
      </div>

      <div>
        <label htmlFor="experience" className="block mb-2 font-medium text-gray-700">
          Как вы оцениваете свой уровень?
        </label>

        <select
          {...register('experience')}
          id="experience"
          className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        >
          <option></option>
          <option>Junior</option>
          <option>Middle</option>
          <option>Senior</option>
          <option>Менеджер</option>
          <option>Менеджер менеджеров</option>
          <option>C-level</option>
        </select>
      </div>

      <div>
        <label htmlFor="telegramUsername" className="block mb-2 font-medium text-gray-700">
          Telegram @username
          <span className="text-sm text-red-700 mt-3 mb-2"> *</span>
        </label>

        {errors.telegramUsername && errors.telegramUsername.type === 'required' && (
          <div className="text-sm text-red-700 mt-3 mb-2">{requiredText}</div>
        )}

        <input
          type="text"
          {...register('telegramUsername', { required: true })}
          id="telegramUsername"
          autoComplete="username"
          className="focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
        />

        <p className="mt-2 text-sm text-gray-500">
          Для того, чтобы ментор смог быстрее с вами связаться. Мы используем Telegram в качестве
          основного средства связи. Если у вас его нет, то напишите в строке выше, как ещё ментор
          может с вами связаться.
        </p>
      </div>

      <input
        type="hidden"
        {...register('recaptchaToken', { required: true })}
        id="recaptchaToken"
      />

      <ReCAPTCHA
        sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_V2_SITE_KEY}
        onChange={handleCaptchaOnChange}
        hl="ru"
      />

      {isError && (
        <div className="text-red-700">
          Ошибка. Скорее всего мы уже чиним, попробуйте отправить заявку позже.
        </div>
      )}

      <button className="button" type="submit" disabled={isLoading}>
        Отправить заявку
      </button>
    </form>
  )
}
