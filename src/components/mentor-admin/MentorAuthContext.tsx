/**
 * Mentor Authentication Context
 *
 * Provides authentication state and methods for the mentor admin area.
 * Session is managed via HttpOnly cookies set by the backend.
 */

import { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react'
import type { ReactNode } from 'react'
import type { MentorSession } from '@/types'
import {
  getMentorSession,
  clearMentorSession,
  requestLogin as apiRequestLogin,
  verifyLogin as apiVerifyLogin,
  logout as apiLogout,
} from '@/lib/mentor-admin-api'

interface MentorAuthContextValue {
  session: MentorSession | null
  isLoading: boolean
  isAuthenticated: boolean
  requestLogin: (email: string) => Promise<{ success: boolean; message?: string }>
  verifyLogin: (token: string) => Promise<{ success: boolean; message?: string }>
  logout: () => Promise<void>
  refreshSession: () => Promise<void>
}

const MentorAuthContext = createContext<MentorAuthContextValue | null>(null)

interface MentorAuthProviderProps {
  children: ReactNode
}

export function MentorAuthProvider({ children }: MentorAuthProviderProps): JSX.Element {
  const [session, setSession] = useState<MentorSession | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Load session on mount by checking with backend
  useEffect(() => {
    let mounted = true

    const loadSession = async (): Promise<void> => {
      try {
        const currentSession = await getMentorSession()
        if (mounted) {
          setSession(currentSession)
        }
      } catch {
        // Failed to fetch session, likely not authenticated
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
      const currentSession = await getMentorSession()
      setSession(currentSession)
    } catch {
      setSession(null)
    }
  }, [])

  const requestLogin = useCallback(async (email: string) => {
    const response = await apiRequestLogin(email)
    return { success: response.success, message: response.message }
  }, [])

  const verifyLogin = useCallback(async (token: string) => {
    const response = await apiVerifyLogin(token)
    if (response.success && response.session) {
      setSession(response.session)
    }
    return { success: response.success, message: response.message }
  }, [])

  const logout = useCallback(async () => {
    try {
      await apiLogout()
    } finally {
      clearMentorSession()
      setSession(null)
    }
  }, [])

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

  return <MentorAuthContext.Provider value={value}>{children}</MentorAuthContext.Provider>
}

export function useMentorAuth(): MentorAuthContextValue {
  const context = useContext(MentorAuthContext)
  if (!context) {
    throw new Error('useMentorAuth must be used within a MentorAuthProvider')
  }
  return context
}
