/**
 * Mentor Authentication Context
 *
 * Provides authentication state and methods for the mentor admin area.
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
  refreshSession: () => void
}

const MentorAuthContext = createContext<MentorAuthContextValue | null>(null)

interface MentorAuthProviderProps {
  children: ReactNode
}

export function MentorAuthProvider({ children }: MentorAuthProviderProps): JSX.Element {
  const [session, setSession] = useState<MentorSession | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Load session on mount
  useEffect(() => {
    const storedSession = getMentorSession()
    setSession(storedSession)
    setIsLoading(false)
  }, [])

  const refreshSession = useCallback(() => {
    const storedSession = getMentorSession()
    setSession(storedSession)
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
    await apiLogout()
    clearMentorSession()
    setSession(null)
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
