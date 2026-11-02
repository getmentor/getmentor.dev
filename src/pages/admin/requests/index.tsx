import Head from 'next/head'
import { AdminAuthProvider, AdminRequestsListPage } from '@/components/admin-moderation'

export default function AdminRequestsPage(): JSX.Element {
  return (
    <AdminAuthProvider>
      <Head>
        <title>Client requests — admin — getmentor.dev</title>
      </Head>
      <AdminRequestsListPage />
    </AdminAuthProvider>
  )
}
