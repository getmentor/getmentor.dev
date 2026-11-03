import { isAdminMentorEmailConflict } from '@/types/admin-moderation'

describe('isAdminMentorEmailConflict', () => {
  it('accepts the backend conflict details', () => {
    expect(
      isAdminMentorEmailConflict({
        code: 'email_conflict',
        mentorId: 'new-id',
        name: 'Ivan',
        slug: 'ivan-2',
        status: 'pending',
      })
    ).toBe(true)
  })

  it('rejects anything else', () => {
    expect(isAdminMentorEmailConflict(undefined)).toBe(false)
    expect(isAdminMentorEmailConflict({ message: 'x' })).toBe(false)
    expect(isAdminMentorEmailConflict({ code: 'email_conflict' })).toBe(false)
  })
})
