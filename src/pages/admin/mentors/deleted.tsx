import Head from 'next/head'
import { AdminAuthProvider, MentorModerationListPage } from '@/components/admin-moderation'

export default function DeletedMentorsPage(): JSX.Element {
  return (
    <AdminAuthProvider>
      <Head>
        <title>Deleted mentors — moderation — getmentor.dev</title>
      </Head>
      <MentorModerationListPage status="deleted" title="Deleted Mentors" />
    </AdminAuthProvider>
  )
}
