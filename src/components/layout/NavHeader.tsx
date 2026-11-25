import { useState } from 'react'
import classNames from 'classnames'
import Link from 'next/link'
import Image from 'next/image'
import { Menu } from '@headlessui/react'
import analytics from '@/lib/analytics'
import styles from './NavHeader.module.css'
import PromoBanner from './PromoBanner'

export const LOGIN_LINKS = [
  { href: '/mentor/login', label: 'Войти как ментор', role: 'mentor' },
  { href: '/mentee/login', label: 'Войти как ученик', role: 'mentee' },
] as const

function trackLoginClick(role: string): void {
  analytics.event(analytics.events.NAV_LOGIN_MENU_CLICKED, { role })
}

/** Desktop: one "Войти" button that opens a menu with both login options. */
function LoginMenu(): JSX.Element {
  return (
    <Menu as="div" className={classNames(styles.loginMenu, 'relative inline-block')}>
      <Menu.Button className={styles.loginButton}>🔑 Войти</Menu.Button>
      <Menu.Items className="absolute right-0 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
        {LOGIN_LINKS.map((link) => (
          <Menu.Item key={link.href}>
            {({ active }) => (
              <Link
                href={link.href}
                onClick={() => trackLoginClick(link.role)}
                className={classNames(active ? 'bg-gray-100' : '', 'text-gray-800')}
              >
                {link.label}
              </Link>
            )}
          </Menu.Item>
        ))}
      </Menu.Items>
    </Menu>
  )
}

function Nav({ variant }: { variant: 'desktop' | 'mobile' }): JSX.Element {
  return (
    <ul>
      <li>
        <Link href="https://blog.getmentor.dev">✍️ Наш блог</Link>
      </li>
      <li>
        <Link href="/bementor">➕ Стать ментором</Link>
      </li>
      <li>
        <Link href="/donate">🍩 Донат</Link>
      </li>
      {variant === 'desktop' ? (
        <li>
          <LoginMenu />
        </li>
      ) : (
        LOGIN_LINKS.map((link) => (
          <li key={link.href}>
            <Link href={link.href} onClick={() => trackLoginClick(link.role)}>
              {link.label}
            </Link>
          </li>
        ))
      )}
    </ul>
  )
}

interface NavHeaderProps {
  className?: string
}

export default function NavHeader({ className }: NavHeaderProps): JSX.Element {
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* Sitewide openmentor.io promo band — rendered here so every page that
          has a nav gets it (admin/dashboard layouts don't use NavHeader). */}
      <PromoBanner />

      <div className={classNames(styles.container, className)}>
        <div className="container flex items-center">
          <Link href="/" className="flex items-center pt-1">
            <Image src="/images/logo.png" width={120} height={24} alt="getmentor.dev" />
          </Link>

          <div className={classNames(styles.toggle, 'md:hidden')} onClick={() => setOpen(!open)}>
            ☰
          </div>
          <div className={classNames(styles.mobile, open ? styles.active : '')}>
            <Nav variant="mobile" />
          </div>
          <div
            className={classNames(styles.overlay, open ? 'block' : 'hidden')}
            onClick={() => setOpen(!open)}
          ></div>

          <nav className={classNames(styles.desktop, 'hidden md:block')}>
            <Nav variant="desktop" />
          </nav>
        </div>
      </div>
    </>
  )
}
