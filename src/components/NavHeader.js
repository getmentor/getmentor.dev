import { useState } from 'react'
import classNames from 'classnames'
import Link from 'next/link'
import styles from  './NavHeader.module.css'

function Nav() {
  return (
    <ul>
      <li><Link href="/#list">🎓 Все менторы</Link></li>
      <li><Link href="/bementor">➕ Стать ментором</Link></li>
      <li><Link href="https://blog.getmentor.dev">📝 Наш блог</Link></li>
      <li><Link href="/donate">🍩 Донат</Link></li>
    </ul>
  )
}

export default function NavHeader() {
  const [open, setOpen] = useState(false)

  return (
    <div className={styles.container}>
      <div className="container flex">
        <div className={styles.brand}>
          <Link href="/">
            <a style={{ border: 'none', opacity: 1 }}>
              <img
                src="https://dl.airtable.com/.attachments/ce89f2fb2d12814c5ff6340be243793d/5ccb3ce5/dp1zHE.png"
                style={{ width: '120px' }}
              />
            </a>
          </Link>
        </div>

        <div
          className={classNames(styles.toggle, 'md:hidden')}
          onClick={() => setOpen(!open)}
        >☰</div>
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
