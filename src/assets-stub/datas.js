import Alexandr from './images/Alexandr.webp'
import Dmitry from './images/Dmitry.webp'
import Sergey from './images/Sergey.webp'
import Veronika from './images/Veronika.webp'

const getAllMentors = [
  {
    id: 887,
    name: 'Александр Богдашкин',
    slug: 'aleksandr-bogdashkin-887',
    job: 'Head of Project Management Office, Lead Project Manager',
    workplace: 'ex-FunCorp',
    about: `Я проектный менеджер с опытом более 15 лет в IT индустрии. Мои основные специализации:
      управление проектами, построение команд и процессов, доставка бизнес результата.`,
    description: `Могу выступить как внешний проектный менеджер или консультант и усилить текущую команду
      управления на сложных этапах, например, при выводе продукта на новые рынки или запуске большого продукта`,
    competencies: `Leadership, Project Management, People Management, Process Improvement, Team Building, Agile, HR, Scrum, Kanban, Team Management`,
    tags: ['Project Management', 'Team Lead/Management', 'Agile'],
    experience: '10+',
    price: '5000 руб',
    menteeCount: 3,
    photo_url: Alexandr,
  },
  {
    id: 1336,
    name: 'Дмитрий Петров',
    slug: 'dmitriy-petrov-1336',
    job: 'Frontend developer',
    workplace: 'Yandex',
    about: `Работаю в it - сфере более 5-ти лет, занимаюсь как frontend (Javascript/ReactJS), так и
      мобильной разработкой(kotlin, ReactNative) в разного размера интернет проектах. Основное направление
      на данный момент - ReactJS. Так же могу помочь с базовыми знаниями JS, пониманием ООП, функциональным
      подходом, алгоритмы, HTTP и т.д`,
    description: `Сам прошёл путь от банковского менеджера до senior front-end engineer и готов поделиться.`,
    competencies: `JavaScript, React, Redux, Vue, NodeJS, Express JS, React Native, Kotlin, Sass, Less`,
    tags: ['Frontend', 'Code Review', 'Собеседования'],
    experience: '2-5',
    price: '2000 руб',
    menteeCount: 0,
    photo_url: Dmitry,
  },
  {
    id: 986,
    name: 'Чадулин Сергей',
    slug: 'chadulin-sergey-986',
    job: 'Ведущий системный аналитик',
    workplace: 'AIM Consulting',
    about: `Уже более 6 лет в IT, из них порядка 4х в системной аналитике. Прошел путь от специалиста
      второй линии поддержки до позиции Senior system analyst.`,
    description: `Помогу в развитии в роли системного аналитика, если вы уже занимаете соответствующую позицию.`,
    competencies: `Интеграция, REST, SOAP, JSON, XML, Swagger, Документирование требований, Проектирование API, BPMN/UML`,
    tags: ['Аналитика', 'Собеседования', 'Карьера'],
    experience: '5-10',
    price: '3000 руб',
    menteeCount: 1,
    photo_url: Sergey,
  },
  {
    id: 734,
    name: 'Вероника Дятлович',
    slug: 'veronika-diatlovich-734',
    job: 'Бизнес-аналитик',
    workplace: 'EPAM Systems',
    about: `Менторские сессии провожу как по своей собственной программе, так и по интересующим вас вопросам.
      Собственная программа сфокусирована на проецирование теории на практический опыт, а так же с обязательным
      выполнением практических заданий. Расчитана на минимум 13 часов. На выходе менти получает готовые проверенные
      артефакты, кторые можно использовать в портфолио. Также помогу сориентировать по резюме, прохождению интервью
      на позицию бизнес-аналитика, проконсультировать по отдельным вопросам.`,
    description: `Обращаться могут Junior BA (без курсов, до курсов, во время курсов и после курсов). Помогу
      сориентироваться в профессии, либо начать вход в неё.`,
    competencies: `Business Analysis, Бизнес-анализ`,
    tags: ['UX/UI/Design', 'Аналитика'],
    experience: '2-5',
    price: 'По договоренности',
    menteeCount: 3,
    photo_url: Veronika,
  },
]

export const getMentorById = (id) => getAllMentors.find((el) => el.id === id)
export const getMentorBySlug = (slug) => getAllMentors.find((el) => el.slug === slug)
export default getAllMentors
