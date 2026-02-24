import Head from 'next/head'
import { AdminAuthProvider, MentorModerationListPage } from '@/components/admin-moderation'

export default function ApprovedMentorsPage(): JSX.Element {
  return (
    <AdminAuthProvider>
      <Head>
        <title>Approved mentors — moderation — getmentor.dev</title>
      </Head>
      <MentorModerationListPage status="approved" title="Approved Mentors" />
    </AdminAuthProvider>
  )
}
