export default function Koalendar({ url }) {
  const embedUrl = url + '?embed=true'

  return <iframe src={embedUrl} width="100%" height="800px" frameBorder="0"></iframe>
}
