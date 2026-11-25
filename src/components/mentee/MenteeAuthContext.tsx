/**
 * Mentee authentication context. The session is an HttpOnly cookie; this only
 * mirrors whether one exists. Analytics identity is the mentee row id (never the email)
 * and is reset on logout, as the mentor provider does.
 */

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import type { MenteeSession } from '@/types'
import {
  getMenteeSession,
  logoutMentee,
  requestMenteeLogin,
  verifyMenteeLogin,
} from '@/lib/mentee-api'
import analytics from '@/lib/analytics'

interface MenteeAuthContextValue {
  session: MenteeSession | null
  isLoading: boolean
  isAuthenticated: boolean
  requestLogin: (email: string) => Promise<{ success: boolean; message?: string }>
  verifyLogin: (token: string) => Promise<boolean>
  logout: () => Promise<void>
}

const MenteeAuthContext = createContext<MenteeAuthContextValue | null>(null)

export function MenteeAuthProvider({ children }: { children: ReactNode }): JSX.Element {
  const [session, setSession] = useState<MenteeSession | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    getMenteeSession()
      .then((s) => mounted && setSession(s))
      .catch(() => mounted && setSession(null))
      .finally(() => mounted && setIsLoading(false))
    return () => {
      mounted = false
    }
  }, [])

  const verifyLogin = useCallback(async (token: string) => {
    const s = await verifyMenteeLogin(token)
    setSession(s)
    return s !== null
  }, [])

  const logout = useCallback(async () => {
    analytics.event(analytics.events.MENTEE_AUTH_LOGOUT, { outcome: 'submitted' })
    try {
      await logoutMentee()
    } finally {
      setSession(null)
      analytics.reset()
    }
  }, [])

  useEffect(() => {
    if (isLoading) return
    if (session?.mentee_id) {
      analytics.identify(`mentee:${session.mentee_id}`, { role: 'mentee' })
    }
  }, [isLoading, session?.mentee_id])

  const value = useMemo(
    () => ({
      session,
      isLoading,
      isAuthenticated: session !== null,
      requestLogin: requestMenteeLogin,
      verifyLogin,
      logout,
    }),
    [session, isLoading, verifyLogin, logout]
  )

  return <MenteeAuthContext.Provider value={value}>{children}</MenteeAuthContext.Provider>
}

export function useMenteeAuth(): MenteeAuthContextValue {
  const context = useContext(MenteeAuthContext)
  if (!context) {
    throw new Error('useMenteeAuth must be used within a MenteeAuthProvider')
  }
  return context
}
