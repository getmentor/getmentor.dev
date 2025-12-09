import type { MentorListItem, MentorWithSecureFields } from '@/types'

// Mock the go-api-client module
jest.mock('@/lib/go-api-client', () => {
  const mockClient = {
    getAllMentors: jest.fn(),
    getOneMentorBySlug: jest.fn(),
    getOneMentorById: jest.fn(),
    getOneMentorByRecordId: jest.fn(),
    forceRefreshCache: jest.fn(),
  }
  return {
    getGoApiClient: jest.fn(() => mockClient),
    __mockClient: mockClient,
  }
})

// Import after mocks
import {
  getAllMentors,
  getOneMentorBySlug,
  getOneMentorById,
  getOneMentorByRecordId,
  forceRefreshCache,
} from '@/server/mentors-data'
import { getGoApiClient } from '@/lib/go-api-client'

// Get reference to mock client
const mockGoApiModule = jest.requireMock('@/lib/go-api-client') as {
  __mockClient: {
    getAllMentors: jest.Mock
    getOneMentorBySlug: jest.Mock
    getOneMentorById: jest.Mock
    getOneMentorByRecordId: jest.Mock
    forceRefreshCache: jest.Mock
  }
}
const mockClient = mockGoApiModule.__mockClient

const mockMentorList: MentorListItem[] = [
  {
    id: 1,
    airtableId: 'rec1',
    slug: 'john-doe',
    name: 'John Doe',
    job: 'Senior Developer',
    workplace: 'Tech Corp',
    description: 'Expert in React',
    about: 'Full bio here',
    competencies: 'React, TypeScript',
    experience: '10+',
    price: '5000 руб',
    tags: ['Frontend', 'React'],
    menteeCount: 15,
    photo_url: null,
    sortOrder: 1,
    isVisible: true,
    isNew: false,
    calendarType: 'calendly',
  },
  {
    id: 2,
    airtableId: 'rec2',
    slug: 'jane-smith',
    name: 'Jane Smith',
    job: 'Tech Lead',
    workplace: 'StartupXYZ',
    description: 'Backend expert',
    about: 'Backend specialist',
    competencies: 'Go, Kubernetes',
    experience: '5-10',
    price: '3000 руб',
    tags: ['Backend', 'DevOps'],
    menteeCount: 8,
    photo_url: 'https://example.com/photo.jpg',
    sortOrder: 2,
    isVisible: true,
    isNew: true,
    calendarType: 'koalendar',
  },
]

const mockMentorWithSecure: MentorWithSecureFields = {
  ...mockMentorList[0],
  authToken: 'secret-token-123',
  calendarUrl: 'https://calendly.com/john-doe',
}

describe('mentors-data', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('uses go-api-client', () => {
    // Verify the mock is set up correctly
    expect(getGoApiClient).toBeDefined()
  })

  describe('getAllMentors', () => {
    it('returns all mentors from Go API', async () => {
      mockClient.getAllMentors.mockResolvedValue(mockMentorList)

      const result = await getAllMentors()

      expect(mockClient.getAllMentors).toHaveBeenCalledWith({})
      expect(result).toEqual(mockMentorList)
      expect(result).toHaveLength(2)
    })

    it('passes onlyVisible param to Go API', async () => {
      mockClient.getAllMentors.mockResolvedValue([mockMentorList[0]])

      await getAllMentors({ onlyVisible: true })

      expect(mockClient.getAllMentors).toHaveBeenCalledWith({ onlyVisible: true })
    })

    it('passes drop_long_fields param to Go API', async () => {
      mockClient.getAllMentors.mockResolvedValue(mockMentorList)

      await getAllMentors({ drop_long_fields: true })

      expect(mockClient.getAllMentors).toHaveBeenCalledWith({ drop_long_fields: true })
    })
  })

  describe('getOneMentorBySlug', () => {
    it('returns mentor by slug', async () => {
      mockClient.getOneMentorBySlug.mockResolvedValue(mockMentorList[0])

      const result = await getOneMentorBySlug('john-doe')

      expect(mockClient.getOneMentorBySlug).toHaveBeenCalledWith('john-doe', {})
      expect(result).toEqual(mockMentorList[0])
    })

    it('returns null when mentor not found', async () => {
      mockClient.getOneMentorBySlug.mockResolvedValue(null)

      const result = await getOneMentorBySlug('non-existent')

      expect(result).toBeNull()
    })

    it('returns mentor with secure fields when showHiddenFields is true', async () => {
      mockClient.getOneMentorBySlug.mockResolvedValue(mockMentorWithSecure)

      const result = await getOneMentorBySlug('john-doe', { showHiddenFields: true })

      expect(mockClient.getOneMentorBySlug).toHaveBeenCalledWith('john-doe', {
        showHiddenFields: true,
      })
      expect(result).toHaveProperty('authToken')
      expect(result).toHaveProperty('calendarUrl')
    })
  })

  describe('getOneMentorById', () => {
    it('returns mentor by ID', async () => {
      mockClient.getOneMentorById.mockResolvedValue(mockMentorList[0])

      const result = await getOneMentorById(1)

      expect(mockClient.getOneMentorById).toHaveBeenCalledWith(1, {})
      expect(result).toEqual(mockMentorList[0])
    })

    it('returns null when mentor not found', async () => {
      mockClient.getOneMentorById.mockResolvedValue(null)

      const result = await getOneMentorById(999)

      expect(result).toBeNull()
    })
  })

  describe('getOneMentorByRecordId', () => {
    it('returns mentor by Airtable record ID', async () => {
      mockClient.getOneMentorByRecordId.mockResolvedValue(mockMentorList[0])

      const result = await getOneMentorByRecordId('rec1')

      expect(mockClient.getOneMentorByRecordId).toHaveBeenCalledWith('rec1', {})
      expect(result).toEqual(mockMentorList[0])
    })
  })

  describe('forceRefreshCache', () => {
    it('triggers cache refresh on Go API', async () => {
      const mockResponse = { success: true, message: 'Cache refreshed' }
      mockClient.forceRefreshCache.mockResolvedValue(mockResponse)

      const result = await forceRefreshCache()

      expect(mockClient.forceRefreshCache).toHaveBeenCalled()
      expect(result).toEqual(mockResponse)
    })
  })
})
