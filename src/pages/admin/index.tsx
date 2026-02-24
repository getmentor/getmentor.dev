import { useEffect } from 'react'
import { useRouter } from 'next/router'

export default function AdminIndexPage(): JSX.Element {
  const router = useRouter()

  useEffect(() => {
    router.replace('/admin/mentors/pending')
  }, [router])

  return <></>
}
