import { useState } from 'react'
import classNames from 'classnames'
import Link from 'next/link'
import Image from 'next/image'
import styles from './NavHeader.module.css'

function Nav() {
  return (
    <ul>
      <li>
        <a href="https://blog.getmentor.dev">✍️ Наш блог</a>
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

export default function NavHeader(props) {
  const [open, setOpen] = useState(false)

  return (
    <div className={classNames(styles.container, props.className)}>
      <div className="container flex items-center">
        <Link href="/">
          <a className="flex items-center pt-1">
            <Image src="/images/logo.png" width={120} height={24} loading="eager" />
          </a>
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
  )
}
