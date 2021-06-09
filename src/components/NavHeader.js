
export default function NavHeader() {
  return (
    <div
      className="nav__container"
      style={{background: '#fcf8f2', position: 'relative'}}
      data-nav-id="header"
    >
      <div className="container">
        <div className="nav__brand">
          <a style={{border: 'none', opacity: 1}} href="/">
            <img
              src="https://dl.airtable.com/.attachments/ce89f2fb2d12814c5ff6340be243793d/5ccb3ce5/dp1zHE.png"
              style={{width: '120px'}}
            />
          </a>
        </div>
        <div className="nav__toggle">☰</div>
        <div className="nav__mobile">
          <ul>
            <li><a href="/#list">🎓 Все менторы</a></li>
            <li><a href="/bementor">➕ Стать ментором</a></li>
            <li><a href="https://blog.getmentor.dev">📝 Наш блог</a></li>
            <li><a href="/donate">🍩 Донат</a></li>
          </ul>
        </div>
        <div className="nav__backdrop"></div>
        <nav className="nav">
          <ul>
            <li><a href="/#list">🎓 Все менторы</a></li>
            <li><a href="/bementor">➕ Стать ментором</a></li>
            <li><a href="https://blog.getmentor.dev">📝 Наш блог</a></li>
            <li><a href="/donate">🍩 Донат</a></li>
          </ul>
        </nav>
      </div>
    </div>
  )
}
