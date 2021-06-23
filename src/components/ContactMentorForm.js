export default function ContactMentorForm() {
  return (
    <form className="px-4 py-5 bg-white space-y-6 sm:p-6">
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-3 sm:col-span-2">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Ваша почта
          </label>

          <input
            type="email"
            name="email"
            id="email"
            autoComplete="email"
            className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-3 sm:col-span-2">
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Ваше имя и фамилия
          </label>

          <input
            type="text"
            name="name"
            id="name"
            autoComplete="name"
            className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-3 sm:col-span-2">
          <label htmlFor="intro" className="block text-sm font-medium text-gray-700">
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
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-3 sm:col-span-2">
          <label htmlFor="experience" className="block text-sm font-medium text-gray-700">
            Как вы оцениваете свой уровень?
          </label>

          <select
            name="experience"
            id="experience"
            className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          >
            <option value="junior">Junior</option>
            <option value="middle">Middle</option>
            <option value="senior">Senior</option>
            <option value="manager">Менеджер</option>
            <option value="manager-of-managers">Менеджер менеджеров</option>
            <option value="c-level">C-level</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-3 sm:col-span-2">
          <label htmlFor="username" className="block text-sm font-medium text-gray-700">
            Telegram @username
          </label>

          <input
            type="text"
            name="username"
            id="username"
            autoComplete="username"
            className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
          />

          <p className="mt-2 text-sm text-gray-500">
            Для того, чтобы ментор смог быстрее с вами связаться. Мы используем Telegram в качестве
            основного средства связи. Если у вас его нет, то напишите в строке ниже, как ещё ментор
            может с вами связаться.
          </p>
        </div>
      </div>

      <button
        type="submit"
        className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        Save
      </button>
    </form>
  )
}
