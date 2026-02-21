import Head from 'next/head'
import { AdminAuthProvider, MentorModerationListPage } from '@/components/admin-moderation'

export default function PendingMentorsPage(): JSX.Element {
  return (
    <AdminAuthProvider>
      <Head>
        <title>Pending mentors — moderation — getmentor.dev</title>
      </Head>
      <MentorModerationListPage status="pending" title="Pending Mentors" />
    </AdminAuthProvider>
  )
}
