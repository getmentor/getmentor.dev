import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-primary-100" data-section="footer">
      <div className="py-8 text-center text-sm">
        <p>
          <a className="link" href="https://t.me/getmentor_dev" target="_blank" rel="noreferrer">
            Telegram
          </a>
          {' | '}
          <a
            className="link"
            href="https://www.facebook.com/getmentor.dev"
            target="_blank"
            rel="noreferrer"
          >
            Facebook
          </a>
          {' | '}
          <a className="link" href="mailto:hello@getmentor.dev">
            Email
          </a>
        </p>
        <p>
          <Link href="/privacy">
            <div className="link">Политика в отношении персональных данных</div>
          </Link>
        </p>
        <p>
          <Link href="/disclaimer">
            <div className="link">Отказ от ответственности</div>
          </Link>
        </p>
      </div>
    </footer>
  )
}
