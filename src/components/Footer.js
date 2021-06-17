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
            <a className="link">Политика в отношении персональных данных</a>
          </Link>
        </p>
        <p>
          <Link href="/disclaimer">
            <a className="link">Отказ от ответственности</a>
          </Link>
        </p>
      </div>
    </footer>
  )
}
