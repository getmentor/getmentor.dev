import { useState } from 'react'
import classNames from 'classnames'
import Link from 'next/link'
import Image from 'next/image'
import styles from './NavHeader.module.css'
import PromoBanner from './PromoBanner'

function Nav(): JSX.Element {
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
            <Nav />
          </div>
          <div
            className={classNames(styles.overlay, open ? 'block' : 'hidden')}
            onClick={() => setOpen(!open)}
          ></div>

          <nav className={classNames(styles.desktop, 'hidden md:block')}>
            <Nav />
          </nav>
        </div>
      </div>
    </>
  )
}
