import Airtable from 'airtable'

const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID)
const mentors = base('Mentors')

export async function getMentors() {
  const items = await mentors.select({
    sort: [{ field: 'Sort Order', direction: 'asc' }],
  }).all()

  return items.map(item => formatRecord(item))
}

export async function getMentor(id) {
  const item = await mentors.find(id)
  return formatRecord(item)
}

function formatRecord(item) {
  return {
    id: item.id,
    name: item.fields['Name'],
    job: item.fields['Должность'],
    description: item.fields['Описание'],
    experience: item.fields['Опыт'],
    price: item.fields['Цена'],
    menteeCount: item.fields['Проведено сессий'],
    photo: item.fields['Фото'][0],
    tags: item.fields['Теги'],
  }
}
