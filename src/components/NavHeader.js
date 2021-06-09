import Link from 'next/link'

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
      className="nav__container"
      style={{ background: '#fcf8f2', position: 'relative' }}
      data-nav-id="header"
    >
      <div className="container">
        <div className="nav__brand">
          <Link href="/">
            <a style={{ border: 'none', opacity: 1 }}>
              <img
                src="https://dl.airtable.com/.attachments/ce89f2fb2d12814c5ff6340be243793d/5ccb3ce5/dp1zHE.png"
                style={{ width: '120px' }}
              />
            </a>
          </Link>
        </div>
        <div className="nav__toggle">☰</div>
        <div className="nav__mobile">
          <Nav />
        </div>
        <div className="nav__backdrop"></div>
        <nav className="nav">
          <Nav />
        </nav>
      </div>
    </div>
  )
}
