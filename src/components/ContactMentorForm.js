export default function ContactMentorForm({ isLoading, isError }) {
  const onSubmit = (e) => {
    e.preventDefault()
  }

  return (
    <form className="space-y-8" onSubmit={onSubmit}>
      <div>
        <label htmlFor="email" className="block mb-2 font-medium text-gray-700">
          Ваша почта
        </label>

        <input
          type="email"
          name="email"
          id="email"
          autoComplete="email"
          className="focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
        />
      </div>

      <div>
        <label htmlFor="name" className="block mb-2 font-medium text-gray-700">
          Ваше имя и фамилия
        </label>

        <input
          type="text"
          name="name"
          id="name"
          autoComplete="name"
          className="focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
        />
      </div>

      <div>
        <label htmlFor="intro" className="block mb-2 font-medium text-gray-700">
          О чём хотите поговорить?
        </label>

        <div className="mt-1">
          <textarea
            id="intro"
            name="intro"
            rows="3"
            className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 mt-1 block w-full sm:text-sm border border-gray-300 rounded-md"
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
          name="experience"
          id="experience"
          className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        >
          <option value="junior">Junior</option>
          <option value="middle">Middle</option>
          <option value="senior">Senior</option>
          <option value="manager">Менеджер</option>
          <option value="manager-of-managers">Менеджер менеджеров</option>
          <option value="c-level">C-level</option>
        </select>
      </div>

      <div>
        <label htmlFor="username" className="block mb-2 font-medium text-gray-700">
          Telegram @username
        </label>

        <input
          type="text"
          name="username"
          id="username"
          autoComplete="username"
          className="focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
        />

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
  )
}
