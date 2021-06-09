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
  return (
    <div
      className={styles.container}
      style={{ background: '#fcf8f2', position: 'relative' }}
      data-nav-id="header"
    >
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
        <div className={styles.toggle}>☰</div>
        <div className={styles.mobile}>
          <Nav />
        </div>
        <div className={styles.backdrop}></div>
        <nav className={styles.desktop}>
          <Nav />
        </nav>
      </div>
    </div>
  )
}
