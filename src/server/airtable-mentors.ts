import Airtable, { Attachment } from 'airtable'

let base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(
  process.env.AIRTABLE_BASE_ID
)

export type Mentor = {
  id: string
  slug: string
  name: string
  job: string
  description: string
  experience: string
  price: string
  menteeCount: number
  photo: Attachment
  photo_url: string
  tags: string[]
  sortOrder: number
  isVisible: boolean
}

export async function getMentors(): Promise<Mentor[]> {
  let mentorsRaw = await base('Mentors')
    .select({
      filterByFormula: 'OR(Status = "active", Status = "inactive")',
      fields: [
        'Alias',
        'Title',
        'Description',
        'Details',
        'Experience',
        'Price',
        'Done Sessions Count',
        'Image_Attachment',
        'Image',
        'Tags',
        'SortOrder',
        'OnSite',
        'Status',
      ],
    })
    .all()

  let mentors = mentorsRaw.map((item): Mentor => {
    return {
      id: item.id as string,
      slug: item.fields['Alias'] as string,
      name: item.fields['Title'] as string,
      job: item.fields['Description'] as string,
      description: item.fields['Details'] as string,
      experience: item.fields['Experience'] as string,
      price: item.fields['Price'] as string,
      menteeCount: item.fields['Done Sessions Count'] as number,
      photo: item.fields['Image_Attachment'][0] as Attachment,
      photo_url: item.fields['Image'] as string,
      tags: (item.fields['Tags'] as string).split(','),
      sortOrder: item.fields['SortOrder'] as number,
      isVisible: item.fields['OnSite'] === 1 && item.fields['Status'] === 'active',
    }
  })

  mentors.sort((a, b) => {
    return a.sortOrder - b.sortOrder
  })

  return mentors
}
