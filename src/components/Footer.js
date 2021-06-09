import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-primary-100" data-section="footer">
      <div className="py-8 text-center text-sm">
        <p>
          <a href="https://t.me/getmentor_dev" target="_blank" rel="noreferrer">Telegram</a>
          {' | '}
          <a href="https://www.facebook.com/getmentor.dev" target="_blank" rel="noreferrer">Facebook</a>
          {' | '}
          <a href="mailto:hello@getmentor.dev">Email</a>
        </p>
        <p>
          <Link href="/privacy">Политика в отношении персональных данных</Link>
        </p>
        <p>
          <Link href="/disclaimer">Отказ от ответственности</Link>
        </p>
      </div>
    </footer>
  )
}
