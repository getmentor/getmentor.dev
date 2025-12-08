interface KoalendarProps {
  url: string
}

export default function Koalendar({ url }: KoalendarProps): JSX.Element {
  const embedUrl = url + '?embed=true'

  return <iframe src={embedUrl} width="100%" height="800px" frameBorder="0"></iframe>
}
