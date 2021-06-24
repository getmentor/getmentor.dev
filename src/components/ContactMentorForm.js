import { useForm } from 'react-hook-form'
import { GoogleReCaptchaProvider, GoogleReCaptcha } from 'react-google-recaptcha-v3'

export default function ContactMentorForm({ isLoading, isError, onSubmit }) {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm()

  function handleVerifyCaptcha(token) {
    setValue('recaptchaToken', token)
  }

  return (
    <GoogleReCaptchaProvider reCaptchaKey={process.env.NEXT_PUBLIC_RECAPTCHA_V3_SITE_KEY}>
      <form className="space-y-8" onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label htmlFor="email" className="block mb-2 font-medium text-gray-700">
            Ваша почта
          </label>

          {errors.email && (
            <div className="text-sm text-red-700 mt-3 mb-2">
              Это поле обязательно для заполнения.
            </div>
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
          </label>

          {errors.name && (
            <div className="text-sm text-red-700 mt-3 mb-2">
              Это поле обязательно для заполнения.
            </div>
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
          </label>

          {errors.intro && (
            <div className="text-sm text-red-700 mt-3 mb-2">
              Это поле обязательно для заполнения.
            </div>
          )}

          <div className="mt-1">
            <textarea
              {...register('intro', { required: true })}
              id="intro"
              className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border border-gray-300 rounded-md"
              rows="3"
            ></textarea>
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
          </label>

          {errors.telegramUsername && (
            <div className="text-sm text-red-700 mt-3 mb-2">
              Это поле обязательно для заполнения.
            </div>
          )}

          <input
            type="text"
            {...register('telegramUsername', { required: true })}
            id="telegramUsername"
            autoComplete="username"
            className="focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
          />

          <input
            type="hidden"
            {...register('recaptchaToken', { required: true })}
            id="recaptchaToken"
          />

          <GoogleReCaptcha onVerify={handleVerifyCaptcha} />

          <p className="mt-2 text-sm text-gray-500">
            Для того, чтобы ментор смог быстрее с вами связаться. Мы используем Telegram в качестве
            основного средства связи. Если у вас его нет, то напишите в строке ниже, как ещё ментор
            может с вами связаться.
          </p>
        </div>

        {isError && (
          <div className="text-red-700">
            Ошибка. Скорее всего мы уже чиним, попробуйте отправить заявку позже.
          </div>
        )}

        {!isLoading ? (
          <button className="button" type="submit">
            Отправить заявку
          </button>
        ) : (
          <div className="py-6">Отправляю заявку...</div>
        )}
      </form>
    </GoogleReCaptchaProvider>
  )
}
