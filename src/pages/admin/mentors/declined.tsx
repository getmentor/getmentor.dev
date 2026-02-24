import Head from 'next/head'
import { AdminAuthProvider, MentorModerationListPage } from '@/components/admin-moderation'

export default function DeclinedMentorsPage(): JSX.Element {
  return (
    <AdminAuthProvider>
      <Head>
        <title>Declined mentors — moderation — getmentor.dev</title>
      </Head>
      <MentorModerationListPage status="declined" title="Declined Mentors" />
    </AdminAuthProvider>
  )
}
