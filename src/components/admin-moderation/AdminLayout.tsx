import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import type { AdminMentorListItem, MentorModerationFilter } from '@/types'
import { getModerationMentors } from '@/lib/admin-moderation-api'
import { useAdminAuth } from './AdminAuthContext'

interface AdminLayoutProps {
  title: string
  children: ReactNode
}

interface TabItem {
  href: string
  label: string
  status: MentorModerationFilter
}

interface StatusEntry {
  mentors?: AdminMentorListItem[]
  isLoading: boolean
  error?: string
}

type StatusMap = Partial<Record<MentorModerationFilter, StatusEntry>>

interface AdminMentorsContextValue {
  getStatusEntry: (status: MentorModerationFilter) => StatusEntry
  refetch: (status?: MentorModerationFilter) => void
}

const AdminMentorsContext = createContext<AdminMentorsContextValue | null>(null)

export function useAdminMentors(): AdminMentorsContextValue {
  const ctx = useContext(AdminMentorsContext)
  if (!ctx) {
    throw new Error('useAdminMentors must be used inside AdminLayout')
  }
  return ctx
}

const EMPTY_ENTRY: StatusEntry = { isLoading: true }

export function AdminLayout({ title, children }: AdminLayoutProps): JSX.Element {
  const router = useRouter()
  const { session, logout } = useAdminAuth()
  const [statusMap, setStatusMap] = useState<StatusMap>({})

  const tabs: TabItem[] = [{ href: '/admin/mentors/pending', label: 'Pending', status: 'pending' }]

  if (session?.role === 'admin') {
    tabs.push({ href: '/admin/mentors/approved', label: 'Approved', status: 'approved' })
    tabs.push({ href: '/admin/mentors/declined', label: 'Declined', status: 'declined' })
  }

  const visibleStatuses: MentorModerationFilter[] =
    session?.role === 'admin' ? ['pending', 'approved', 'declined'] : ['pending']
  const visibleKey = visibleStatuses.join(',')

  const fetchStatus = useCallback(async (status: MentorModerationFilter): Promise<void> => {
    setStatusMap((prev) => ({
      ...prev,
      [status]: { ...(prev[status] ?? {}), isLoading: true, error: undefined },
    }))
    try {
      const mentors = await getModerationMentors(status)
      setStatusMap((prev) => ({
        ...prev,
        [status]: { mentors, isLoading: false },
      }))
    } catch (err) {
      setStatusMap((prev) => ({
        ...prev,
        [status]: {
          ...(prev[status] ?? {}),
          isLoading: false,
          error: err instanceof Error ? err.message : 'Failed to load mentors',
        },
      }))
    }
  }, [])

  useEffect(() => {
    if (!session) return
    visibleStatuses.forEach((status) => {
      void fetchStatus(status)
    })
    // visibleKey captures the visible-statuses array identity
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, visibleKey, fetchStatus])

  const getStatusEntry = useCallback(
    (status: MentorModerationFilter): StatusEntry => statusMap[status] ?? EMPTY_ENTRY,
    [statusMap]
  )

  const refetch = useCallback(
    (status?: MentorModerationFilter): void => {
      const targets = status ? [status] : visibleStatuses
      targets.forEach((s) => {
        void fetchStatus(s)
      })
    },
    [fetchStatus, visibleStatuses]
  )

  const onLogout = async (): Promise<void> => {
    await logout()
    router.replace('/admin/login')
  }

  return (
    <AdminMentorsContext.Provider value={{ getStatusEntry, refetch }}>
      <div className="min-h-screen bg-gray-50">
        <header className="border-b border-gray-200 bg-white">
          <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-4">
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-500">getmentor.dev admin</p>
              <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-800">{session?.name}</p>
                <p className="text-xs text-gray-500">{session?.role}</p>
              </div>
              <button
                onClick={onLogout}
                className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Logout
              </button>
            </div>
          </div>
          <div className="mx-auto flex w-full max-w-7xl gap-3 px-4 pb-4">
            {tabs.map((tab) => {
              const isActive = router.pathname === tab.href
              const entry = statusMap[tab.status]
              const count = entry?.mentors?.length
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={
                    isActive
                      ? 'rounded-md bg-[#1A2238] px-3 py-2 text-sm font-medium text-white'
                      : 'rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100'
                  }
                >
                  {tab.label}
                  {typeof count === 'number' ? ` (${count})` : ''}
                </Link>
              )
            })}
          </div>
        </header>
        <main className="mx-auto w-full max-w-7xl px-4 py-6">{children}</main>
      </div>
    </AdminMentorsContext.Provider>
  )
}
