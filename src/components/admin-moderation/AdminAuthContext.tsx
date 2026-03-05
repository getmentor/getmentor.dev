import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react'
import type { ReactNode } from 'react'
import type { AdminSession } from '@/types'
import {
  getAdminSession,
  clearAdminSession,
  requestAdminLogin as apiRequestAdminLogin,
  verifyAdminLogin as apiVerifyAdminLogin,
  logoutAdmin as apiLogoutAdmin,
} from '@/lib/admin-moderation-api'
import analytics from '@/lib/analytics'

interface AdminAuthContextValue {
  session: AdminSession | null
  isLoading: boolean
  isAuthenticated: boolean
  requestLogin: (email: string) => Promise<{ success: boolean; message?: string }>
  verifyLogin: (token: string) => Promise<{ success: boolean; message?: string }>
  logout: () => Promise<void>
  refreshSession: () => Promise<void>
}

const AdminAuthContext = createContext<AdminAuthContextValue | null>(null)

interface AdminAuthProviderProps {
  children: ReactNode
}

export function AdminAuthProvider({ children }: AdminAuthProviderProps): JSX.Element {
  const [session, setSession] = useState<AdminSession | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    const loadSession = async (): Promise<void> => {
      try {
        const currentSession = await getAdminSession()
        if (mounted) {
          setSession(currentSession)
        }
      } catch {
        if (mounted) {
          setSession(null)
        }
      } finally {
        if (mounted) {
          setIsLoading(false)
        }
      }
    }

    loadSession()
    return () => {
      mounted = false
    }
  }, [])

  const refreshSession = useCallback(async () => {
    try {
      const currentSession = await getAdminSession()
      setSession(currentSession)
    } catch {
      setSession(null)
    }
  }, [])

  const requestLogin = useCallback(async (email: string) => {
    const response = await apiRequestAdminLogin(email)
    return { success: response.success, message: response.message }
  }, [])

  const verifyLogin = useCallback(async (token: string) => {
    const response = await apiVerifyAdminLogin(token)
    if (response.success && response.session) {
      setSession(response.session)
    }
    return { success: response.success, message: response.message }
  }, [])

  const logout = useCallback(async () => {
    if (session?.moderatorId) {
      analytics.event(analytics.events.ADMIN_AUTH_LOGOUT, {
        moderator_id: session.moderatorId,
        moderator_role: session.role,
        outcome: 'submitted',
      })
    }

    try {
      await apiLogoutAdmin()
    } finally {
      clearAdminSession()
      setSession(null)
    }
  }, [session])

  useEffect(() => {
    if (isLoading) return

    if (session?.moderatorId) {
      analytics.identify(`moderator:${session.moderatorId}`, {
        role: session.role,
      })
      return
    }

    analytics.reset()
  }, [isLoading, session?.moderatorId, session?.role])

  const value = useMemo(
    () => ({
      session,
      isLoading,
      isAuthenticated: session !== null,
      requestLogin,
      verifyLogin,
      logout,
      refreshSession,
    }),
    [session, isLoading, requestLogin, verifyLogin, logout, refreshSession]
  )

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>
}

export function useAdminAuth(): AdminAuthContextValue {
  const context = useContext(AdminAuthContext)
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider')
  }
  return context
}
