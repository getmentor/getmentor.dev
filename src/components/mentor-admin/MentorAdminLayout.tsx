/**
 * Layout component for Mentor Admin pages
 *
 * Provides consistent header, navigation, and footer for all mentor admin pages.
 */

import { useState } from 'react'
import type { ReactNode } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/router'
import classNames from 'classnames'
import { useMentorAuth } from './MentorAuthContext'

interface MentorAdminLayoutProps {
  children: ReactNode
  title?: string
}

interface NavItemProps {
  href: string
  label: string
  isActive: boolean
}

function NavItem({ href, label, isActive }: NavItemProps): JSX.Element {
  return (
    <Link
      href={href}
      className={classNames(
        'block px-4 py-2 rounded-md text-sm font-medium transition-colors',
        isActive
          ? 'bg-indigo-100 text-indigo-700'
          : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
      )}
    >
      {label}
    </Link>
  )
}

export default function MentorAdminLayout({
  children,
  title,
}: MentorAdminLayoutProps): JSX.Element {
  const router = useRouter()
  const { session, logout } = useMentorAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLogout = async (): Promise<void> => {
    setIsLoggingOut(true)
    try {
      await logout()
      router.push('/mentor/login')
    } finally {
      setIsLoggingOut(false)
    }
  }

  const isActive = (path: string): boolean => {
    if (path === '/mentor' && router.pathname === '/mentor') return true
    if (path !== '/mentor' && router.pathname.startsWith(path)) return true
    return false
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/mentor" className="flex items-center">
              <Image src="/images/logo.png" width={120} height={24} alt="getmentor.dev" />
              <span className="ml-3 text-sm font-medium text-gray-500 hidden sm:block">
                Личный кабинет
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-4">
              <NavItem
                href="/mentor"
                label="Активные заявки"
                isActive={isActive('/mentor') && !isActive('/mentor/past')}
              />
              <NavItem
                href="/mentor/past"
                label="Архив заявок"
                isActive={isActive('/mentor/past')}
              />
              <div className="h-6 w-px bg-gray-200 mx-2" />
              {session && <span className="text-sm text-gray-500 mr-2">{session.name}</span>}
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="text-sm text-gray-600 hover:text-gray-900 font-medium disabled:opacity-50"
              >
                {isLoggingOut ? 'Выход...' : 'Выйти'}
              </button>
            </nav>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100"
              aria-label="Меню"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {mobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white">
            <div className="px-4 py-3 space-y-2">
              <NavItem
                href="/mentor"
                label="Активные заявки"
                isActive={isActive('/mentor') && !isActive('/mentor/past')}
              />
              <NavItem
                href="/mentor/past"
                label="Архив заявок"
                isActive={isActive('/mentor/past')}
              />
              <div className="border-t border-gray-200 my-2" />
              {session && <p className="px-4 py-2 text-sm text-gray-500">{session.name}</p>}
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="w-full text-left px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-md disabled:opacity-50"
              >
                {isLoggingOut ? 'Выход...' : 'Выйти'}
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {title && <h1 className="text-2xl font-semibold text-gray-900 mb-6">{title}</h1>}
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-center text-sm text-gray-500">
            <Link href="/" className="hover:text-gray-700">
              getmentor.dev
            </Link>{' '}
            — Платформа менторства
          </p>
        </div>
      </footer>
    </div>
  )
}
